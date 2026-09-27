import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  LensBackdropSource,
  LensCapabilitySnapshot,
  LensMaterialIntent,
  LensSourceReadability,
} from '@/components/fluid-glass/lens'
import {
  ACTIVE_LENS_GEOMETRY_POLICY,
  COUPLED_GEOMETRY_ENABLED,
  ContextRecoveryController,
  LensMotionOwnershipRegistry,
  RendererLifecycleController,
  WebGlScopePilotGuard,
  adaptEnvironmentSource,
  advanceReadability,
  canTransition,
  describeBackdropSource,
  isCorsEligible,
  readLensState,
  resolveGeometryPolicy,
  resolveLensBackend,
  resolveLensCapabilities,
  toConsumerState,
  toLegacyBackend,
} from '@/components/fluid-glass/lens'
import { FluidGlassStore } from '@/components/fluid-glass/renderer/store'

function capability(overrides: Partial<Parameters<typeof resolveLensCapabilities>[0]> = {}) {
  return resolveLensCapabilities({
    cssBackdropFilter: true,
    webgl: true,
    advancedEffectsAllowed: true,
    webglScopeAvailable: true,
    rendererHealthy: true,
    ...overrides,
  })
}

function resolve(
  source: LensBackdropSource,
  options: {
    readability?: LensSourceReadability
    capability?: LensCapabilitySnapshot
    intent?: LensMaterialIntent
    allowExperimentalTransmission?: boolean
  } = {},
) {
  return resolveLensBackend({
    source: describeBackdropSource(source, options.readability),
    capability: options.capability ?? capability(),
    intent: options.intent ?? 'refractive',
    allowExperimentalTransmission: options.allowExperimentalTransmission,
  })
}

describe('backdrop source classification', () => {
  it('classifies arbitrary DOM as unreadable and never texture eligible', () => {
    const descriptor = describeBackdropSource({ kind: 'auto-dom' })

    expect(descriptor.category).toBe('arbitrary-dom')
    expect(descriptor.lifecycle).toBe('event-driven')
    expect(descriptor.readability).toBe('unreadable')
    expect(descriptor.textureEligible).toBe(false)
  })

  it('classifies each supported kind with a category and lifecycle', () => {
    const kinds = [
      ['theme', 'synthetic-environment', 'static'],
      ['image', 'controlled-readable', 'static'],
      ['canvas', 'controlled-readable', 'per-frame'],
      ['video', 'controlled-readable', 'per-frame'],
      ['renderer-texture', 'controlled-readable', 'externally-managed'],
      ['controlled-surface', 'controlled-readable', 'event-driven'],
      ['unavailable', 'unavailable', 'static'],
    ] as const

    for (const [kind, category, lifecycle] of kinds) {
      const source = {
        theme: { kind: 'theme' },
        image: { kind: 'image', src: '/local.png' },
        canvas: { kind: 'canvas', canvas: null },
        video: { kind: 'video', src: '/clip.mp4' },
        'renderer-texture': { kind: 'renderer-texture', textureId: 't' },
        'controlled-surface': { kind: 'controlled-surface', surfaceId: 's' },
        unavailable: { kind: 'unavailable' },
      }[kind] as LensBackdropSource

      const descriptor = describeBackdropSource(source)
      expect(descriptor.lifecycle).toBe(lifecycle)

      expect(descriptor.category).toBe(category)
    }
  })

  it('demotes a controlled source to controlled-unreadable when the probe fails', () => {
    const descriptor = describeBackdropSource({ kind: 'image', src: '/local.png' }, 'failed')

    expect(descriptor.category).toBe('controlled-unreadable')
    expect(descriptor.textureEligible).toBe(false)
  })

  it('treats cross-origin sources without an opt-in as ineligible', () => {
    expect(isCorsEligible({ kind: 'image', src: 'https://other.example/a.png' })).toBe(false)
    expect(
      isCorsEligible({
        kind: 'image',
        src: 'https://other.example/a.png',
        crossOrigin: 'anonymous',
      }),
    ).toBe(true)
    expect(isCorsEligible({ kind: 'image', src: '/a.png' })).toBe(true)
  })

  it('adapts the existing environment API without changing its meaning', () => {
    expect(adaptEnvironmentSource({ type: 'theme', tone: 'dark' })).toEqual({
      kind: 'theme',
      pattern: undefined,
      tone: 'dark',
    })
    expect(adaptEnvironmentSource({ type: 'image', src: '/x.png' })).toEqual({
      kind: 'image',
      src: '/x.png',
    })
    expect(adaptEnvironmentSource(undefined).kind).toBe('unavailable')
  })
})

describe('readability state transitions', () => {
  it('moves through the documented states', () => {
    expect(advanceReadability('unknown', 'probe-readable')).toBe('readable')
    expect(advanceReadability('unknown', 'probe-unreadable')).toBe('unreadable')
    expect(advanceReadability('unknown', 'load-failed')).toBe('failed')
    expect(advanceReadability('readable', 'source-removed')).toBe('unavailable')
    expect(advanceReadability('unreadable', 'probe-readable')).toBe('readable')
  })

  it('keeps failure terminal until an explicit reset', () => {
    expect(advanceReadability('failed', 'probe-readable')).toBe('failed')
    expect(advanceReadability('failed', 'reset')).toBe('unknown')
  })
})

describe('capability resolution', () => {
  it('reports WebGL and native SVG as independent axes', () => {
    const noSvg = capability({ nativeSvgRefraction: false, webgl: true })
    expect(noSvg.webgl).toBe(true)
    expect(noSvg.nativeSvgRefraction).toBe(false)

    const svgOnly = capability({
      nativeSvgRefraction: true,
      nativeSvgExperimentalEnabled: true,
      webgl: false,
    })
    expect(svgOnly.nativeSvgRefraction).toBe(true)
    expect(svgOnly.webgl).toBe(false)
  })

  it('keeps native SVG off until the experimental opt-in is set', () => {
    expect(capability({ nativeSvgRefraction: true }).nativeSvgRefraction).toBe(false)
    expect(capability({ nativeSvgRefraction: true }).notes).toContain('native-svg-not-opted-in')
  })

  it('explains why WebGL is unusable', () => {
    expect(capability({ reducedTransparency: true }).webglUsable).toBe(false)
    expect(capability({ advancedEffectsAllowed: false }).notes).toContain('advanced-effects-denied')
    expect(capability({ webglScopeAvailable: false }).notes).toContain('webgl-scope-taken')
    expect(capability({ rendererHealthy: false }).notes).toContain('renderer-unhealthy')
  })
})

describe('backend resolution by source category', () => {
  it('never resolves arbitrary DOM to a WebGL backend', () => {
    for (const intent of ['refractive', 'transmission-experimental'] as const) {
      const result = resolve({ kind: 'auto-dom' }, { intent, allowExperimentalTransmission: true })
      expect(result.backend).not.toBe('sdf')
      expect(result.backend).not.toBe('transmission-experimental')
    }
  })

  it('resolves arbitrary DOM to CSS approximation by default', () => {
    const result = resolve({ kind: 'auto-dom' }, { intent: 'css' })

    expect(result.backend).toBe('css-approximation')
    expect(result.reason).toBe('arbitrary-dom-pilot-policy')
  })

  it('resolves arbitrary DOM to native SVG only behind the experimental capability', () => {
    const optedIn = capability({ nativeSvgRefraction: true, nativeSvgExperimentalEnabled: true })
    expect(resolve({ kind: 'auto-dom' }, { capability: optedIn }).backend).toBe('native-svg')
    expect(resolve({ kind: 'auto-dom' }).backend).toBe('css-approximation')
  })

  it('resolves a readable controlled source to SDF when every condition holds', () => {
    const result = resolve({ kind: 'image', src: '/local.png' }, { readability: 'readable' })

    expect(result.backend).toBe('sdf')
    expect(result.reason).toBe('eligible-controlled-source')
    expect(result.degraded).toBe(false)
  })

  it('downgrades an unreadable controlled source with a reason', () => {
    const result = resolve({ kind: 'image', src: '/local.png' }, { readability: 'unreadable' })

    expect(result.backend).toBe('css-approximation')
    expect(result.reason).toBe('source-unreadable')
  })

  it('falls back to solid when no CSS backdrop filter exists and transparency is reduced', () => {
    expect(
      resolve({ kind: 'auto-dom' }, { capability: capability({ cssBackdropFilter: false }) })
        .backend,
    ).toBe('css-glass')
    expect(resolve({ kind: 'unavailable' }).backend).toBe('css-approximation')
  })
})

describe('accessibility and permission precedence', () => {
  it('lets reduced transparency outrank an otherwise eligible SDF source', () => {
    const result = resolve(
      { kind: 'image', src: '/local.png' },
      { readability: 'readable', capability: capability({ reducedTransparency: true }) },
    )

    expect(result.backend).toBe('solid')
    expect(result.reason).toBe('reduced-transparency')
    expect(result.precedence).toBe('accessibility')
  })

  it('places renderer failure above the advanced-effects permission', () => {
    const result = resolve(
      { kind: 'image', src: '/local.png' },
      {
        readability: 'readable',
        capability: capability({ rendererHealthy: false, advancedEffectsAllowed: false }),
      },
    )

    expect(result.precedence).toBe('failure')
    expect(result.reason).toBe('renderer-failure')
  })

  it('blocks SDF when advanced effects are not permitted', () => {
    const result = resolve(
      { kind: 'image', src: '/local.png' },
      { readability: 'readable', capability: capability({ advancedEffectsAllowed: false }) },
    )

    expect(result.backend).toBe('css-approximation')
    expect(result.precedence).toBe('permission')
  })
})

describe('transmission stays experimental', () => {
  it('is never selected automatically by the production resolver', () => {
    const intents: ReadonlyArray<LensMaterialIntent> = ['solid', 'css', 'refractive']

    for (const intent of intents) {
      const result = resolve(
        { kind: 'image', src: '/local.png' },
        { readability: 'readable', intent },
      )
      expect(result.backend).not.toBe('transmission-experimental')
    }
  })

  it('is unreachable even when requested without the explicit opt-in', () => {
    const result = resolve(
      { kind: 'image', src: '/local.png' },
      { readability: 'readable', intent: 'transmission-experimental' },
    )

    expect(result.backend).toBe('css-approximation')
  })

  it('remains available behind the explicit opt-in', () => {
    const result = resolve(
      { kind: 'image', src: '/local.png' },
      {
        readability: 'readable',
        intent: 'transmission-experimental',
        allowExperimentalTransmission: true,
      },
    )

    expect(result.backend).toBe('transmission-experimental')
    expect(toLegacyBackend(result.backend)).toBe('transmission')
  })
})

describe('one active WebGL scope pilot guard', () => {
  let guard: WebGlScopePilotGuard

  beforeEach(() => {
    guard = new WebGlScopePilotGuard()
  })

  it('grants the slot to the first scope only', () => {
    expect(guard.acquire('a').granted).toBe(true)

    const second = guard.acquire('b')
    expect(second.granted).toBe(false)
    expect(second.reason).toBe('scope-limit-reached')
    expect(second.ownerId).toBe('a')
  })

  it('downgrades a second scope with an observable reason', () => {
    guard.acquire('a')
    const result = resolve(
      { kind: 'image', src: '/local.png' },
      {
        readability: 'readable',
        capability: capability({ webglScopeAvailable: guard.canAcquire('b') }),
      },
    )

    expect(result.backend).toBe('css-approximation')
    expect(result.reason).toBe('webgl-scope-unavailable')
    expect(result.precedence).toBe('scope')
  })

  it('lets a later scope acquire the slot after release', () => {
    guard.acquire('a')
    expect(guard.canAcquire('b')).toBe(false)

    guard.release('a')

    expect(guard.canAcquire('b')).toBe(true)
    expect(guard.acquire('b').granted).toBe(true)
    expect(guard.ownerId).toBe('b')
  })

  it('notifies subscribers so a downgraded scope can re-resolve', () => {
    const listener = vi.fn()
    guard.subscribe(listener)

    guard.acquire('a')
    guard.release('a')

    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('is idempotent for the current owner', () => {
    guard.acquire('a')
    expect(guard.acquire('a').reason).toBe('already-owner')
    expect(guard.activeCount).toBe(1)
  })
})

describe('renderer lifecycle', () => {
  it('permits only declared transitions', () => {
    expect(canTransition('idle', 'creating')).toBe(true)
    expect(canTransition('creating', 'ready')).toBe(true)
    expect(canTransition('ready', 'context-lost')).toBe(true)
    expect(canTransition('context-lost', 'recovering')).toBe(true)
    expect(canTransition('terminal-fallback', 'ready')).toBe(false)
    expect(canTransition('disposed', 'ready')).toBe(false)
  })

  it('reports health only while the renderer can produce output', () => {
    const controller = new RendererLifecycleController()
    controller.transition('creating', 'mount')
    controller.transition('ready', 'created')
    expect(controller.healthy).toBe(true)

    controller.transition('context-lost', 'lost')
    expect(controller.healthy).toBe(false)
  })

  it('releases every renderer-owned resource exactly once and is safe to repeat', () => {
    const controller = new RendererLifecycleController()
    const listener = vi.fn()
    const resource = vi.fn()
    const canvas = vi.fn()
    const scope = vi.fn()

    controller.register('listener', listener)
    controller.register('resource', resource)
    controller.register('canvas', canvas)
    controller.register('scope', scope)

    controller.dispose()
    controller.dispose()
    controller.dispose()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(resource).toHaveBeenCalledTimes(1)
    expect(canvas).toHaveBeenCalledTimes(1)
    expect(scope).toHaveBeenCalledTimes(1)
    expect(controller.state).toBe('disposed')
    expect(controller.disposalReport).toEqual({
      listener: 1,
      resource: 1,
      canvas: 1,
      scope: 1,
    })
  })

  it('tears down immediately when registering after disposal', () => {
    const controller = new RendererLifecycleController()
    const teardown = vi.fn()

    controller.dispose()
    controller.register('resource', teardown)

    expect(teardown).toHaveBeenCalledTimes(1)
  })

  it('does not leave resources stranded when one teardown throws', () => {
    const controller = new RendererLifecycleController()
    const survivor = vi.fn()

    controller.register('resource', () => {
      throw new Error('gpu teardown failed')
    })
    controller.register('canvas', survivor)

    expect(() => controller.dispose()).not.toThrow()
    expect(survivor).toHaveBeenCalledTimes(1)
  })
})

describe('bounded context recovery', () => {
  it('falls back immediately on loss and reports the renderer as unhealthy', () => {
    const controller = new ContextRecoveryController(2)
    const snapshot = controller.notifyContextLost()

    expect(snapshot.phase).toBe('lost')
    expect(snapshot.rendererHealthy).toBe(false)
    expect(snapshot.reason).toBe('context-lost')
  })

  it('restores health after a successful bounded recovery', () => {
    const controller = new ContextRecoveryController(2)
    controller.notifyContextLost()
    expect(controller.beginRecovery().phase).toBe('recovering')

    const restored = controller.notifyRestored()
    expect(restored.phase).toBe('healthy')
    expect(restored.attempts).toBe(0)
  })

  it('becomes terminal once the attempt budget is exhausted', () => {
    const controller = new ContextRecoveryController(2)

    controller.notifyContextLost()
    controller.beginRecovery()
    controller.notifyContextLost()
    controller.beginRecovery()
    const terminal = controller.notifyContextLost()

    expect(terminal.phase).toBe('terminal')
    expect(terminal.reason).toBe('attempts-exhausted')
    expect(controller.canAttemptRecovery).toBe(false)
  })

  it('cannot leave the terminal state, which is what bounds the retry loop', () => {
    const controller = new ContextRecoveryController(1)
    controller.notifyTerminal('renderer-error')

    expect(controller.notifyRestored().phase).toBe('terminal')
    expect(controller.beginRecovery().phase).toBe('terminal')
    expect(controller.notifyContextLost().phase).toBe('terminal')
  })
})

describe('geometry policy seam', () => {
  it('runs the pilot on lens-only with coupled disabled', () => {
    expect(ACTIVE_LENS_GEOMETRY_POLICY).toBe('lens-only')
    expect(COUPLED_GEOMETRY_ENABLED).toBe(false)
  })

  it('refuses a coupled request and explains the downgrade', () => {
    const resolved = resolveGeometryPolicy('coupled')

    expect(resolved.policy).toBe('lens-only')
    expect(resolved.downgraded).toBe(true)
    expect(resolved.reason).toBe('coupled-disabled')
  })

  it('allows only one motion owner per target', () => {
    const registry = new LensMotionOwnershipRegistry()

    expect(registry.claim('tab-1', 'lens-spring')).toBe(true)
    expect(registry.claim('tab-1', 'drag-controller')).toBe(false)

    registry.release('tab-1', 'lens-spring')
    expect(registry.claim('tab-1', 'drag-controller')).toBe(true)
  })
})

describe('renderer-neutral lens state', () => {
  it('projects the store without exposing renderer internals', () => {
    const store = new FluidGlassStore()
    const snapshot = readLensState(store)

    expect(snapshot.geometryPolicy).toBe('lens-only')
    expect(snapshot.resolvedTargetId).toBeNull()
    expect(snapshot.visible).toBe(false)
    expect(Object.keys(snapshot).sort()).toEqual([
      'current',
      'desired',
      'generation',
      'geometryPolicy',
      'interaction',
      'motion',
      'opacity',
      'resolvedTargetId',
      'scopeId',
      'visible',
    ])

    store.destroy()
  })
})

describe('consumer state separation', () => {
  it('exposes a visual mode rather than a renderer name', () => {
    const sdf = toConsumerState(
      resolve({ kind: 'image', src: '/local.png' }, { readability: 'readable' }),
    )
    expect(sdf).toEqual({
      materialAvailable: true,
      visualMode: 'refractive',
      degraded: false,
      unavailable: false,
    })

    const reduced = toConsumerState(
      resolve(
        { kind: 'image', src: '/local.png' },
        { readability: 'readable', capability: capability({ reducedTransparency: true }) },
      ),
    )
    expect(reduced.visualMode).toBe('solid')
    expect(reduced.materialAvailable).toBe(false)
  })
})
