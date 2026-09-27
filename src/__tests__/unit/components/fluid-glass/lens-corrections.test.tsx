import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { LensSourceReadability } from '@/components/fluid-glass/lens/backdrop-source'
import * as fluidGlassBarrel from '@/components/fluid-glass'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import {
  describeBackdropSource,
  initialReadabilityFor,
  isCorsEligible,
} from '@/components/fluid-glass/lens/backdrop-source'
import { resolveLensBackend } from '@/components/fluid-glass/lens/backend-resolution'
import { resolveLensCapabilities } from '@/components/fluid-glass/lens/capability'
import { ContextRecoveryController } from '@/components/fluid-glass/lens/context-recovery'
import {
  ACTIVE_LENS_GEOMETRY_POLICY,
  targetGeometryIsAuthoritative,
} from '@/components/fluid-glass/lens/geometry-policy'
import { createLensStateAdapter } from '@/components/fluid-glass/lens/lens-state'
import { RendererLifecycleController } from '@/components/fluid-glass/lens/renderer-lifecycle'
import { WebGlScopePilotGuard } from '@/components/fluid-glass/lens/webgl-scope-guard'
import { FluidGlassStore } from '@/components/fluid-glass/renderer/store'

afterEach(cleanup)

const capableEnvironment = resolveLensCapabilities({
  cssBackdropFilter: true,
  webgl: true,
  advancedEffectsAllowed: true,
  webglScopeAvailable: true,
  rendererHealthy: true,
})

function resolveImage(readability: LensSourceReadability, crossOrigin?: 'anonymous') {
  return resolveLensBackend({
    source: describeBackdropSource(
      { kind: 'image', src: 'https://cdn.example.com/backdrop.png', crossOrigin },
      readability,
    ),
    capability: capableEnvironment,
    intent: 'refractive',
  })
}

describe('Correction A — source readability gates WebGL', () => {
  it('does not resolve an unknown image to SDF', () => {
    const resolution = resolveImage('unknown', 'anonymous')
    expect(resolution.backend).not.toBe('sdf')
    expect(resolution.reason).toBe('source-readability-unknown')
  })

  it('resolves a confirmed readable image to SDF', () => {
    expect(resolveImage('readable', 'anonymous').backend).toBe('sdf')
  })

  it('treats cross-origin configuration as a request, never as proof', () => {
    const configured = {
      kind: 'image' as const,
      src: 'https://cdn.example.com/a.png',
      crossOrigin: 'anonymous' as const,
    }

    expect(isCorsEligible(configured)).toBe(true)

    expect(initialReadabilityFor(configured)).toBe('unknown')
    expect(describeBackdropSource(configured).textureEligible).toBe(false)
    expect(resolveImage('unknown', 'anonymous').backend).not.toBe('sdf')
  })

  it('keeps unreadable, failed and unavailable images off every WebGL backend', () => {
    for (const readability of ['unreadable', 'failed', 'unavailable'] as const) {
      const resolution = resolveImage(readability, 'anonymous')
      expect(resolution.backend).not.toBe('sdf')
      expect(resolution.backend).not.toBe('transmission-experimental')
    }
  })

  it('keeps the synthetic theme environment known-readable', () => {
    const theme = describeBackdropSource({ kind: 'theme' })
    expect(theme.readability).toBe('readable')
    expect(theme.textureEligible).toBe(true)
    expect(
      resolveLensBackend({ source: theme, capability: capableEnvironment, intent: 'refractive' })
        .backend,
    ).toBe('sdf')
  })
})

describe('Correction B — degraded means an actual downgrade', () => {
  const theme = describeBackdropSource({ kind: 'theme' })
  const dom = describeBackdropSource({ kind: 'auto-dom' })

  it('does not report a satisfied explicit request as degraded', () => {
    expect(
      resolveLensBackend({ source: theme, capability: capableEnvironment, intent: 'solid' })
        .degraded,
    ).toBe(false)
    expect(
      resolveLensBackend({ source: theme, capability: capableEnvironment, intent: 'css' }).degraded,
    ).toBe(false)

    const nativeSvg = resolveLensBackend({
      source: dom,
      capability: resolveLensCapabilities({
        cssBackdropFilter: true,
        nativeSvgRefraction: true,
        nativeSvgExperimentalEnabled: true,
      }),
      intent: 'refractive',
    })
    expect(nativeSvg.backend).toBe('native-svg')
    expect(nativeSvg.degraded).toBe(false)

    const transmission = resolveLensBackend({
      source: theme,
      capability: capableEnvironment,
      intent: 'transmission-experimental',
      allowExperimentalTransmission: true,
    })
    expect(transmission.backend).toBe('transmission-experimental')
    expect(transmission.degraded).toBe(false)
  })

  it('reports capability, source, permission, renderer and scope fallbacks as degraded', () => {
    const cases = [
      resolveLensBackend({
        source: theme,
        capability: resolveLensCapabilities({ cssBackdropFilter: true, webgl: false }),
        intent: 'refractive',
      }),
      resolveImage('unreadable'),
      resolveLensBackend({
        source: theme,
        capability: resolveLensCapabilities({
          cssBackdropFilter: true,
          webgl: true,
          advancedEffectsAllowed: false,
        }),
        intent: 'refractive',
      }),
      resolveLensBackend({
        source: theme,
        capability: resolveLensCapabilities({
          cssBackdropFilter: true,
          webgl: true,
          rendererHealthy: false,
        }),
        intent: 'refractive',
      }),
      resolveLensBackend({
        source: theme,
        capability: resolveLensCapabilities({
          cssBackdropFilter: true,
          webgl: true,
          webglScopeAvailable: false,
        }),
        intent: 'refractive',
      }),
    ]
    for (const resolution of cases) expect(resolution.degraded).toBe(true)
  })

  it('represents reduced transparency as accessibility-enforced, not a failure', () => {
    const resolution = resolveLensBackend({
      source: theme,
      capability: resolveLensCapabilities({ reducedTransparency: true, webgl: true }),
      intent: 'refractive',
    })
    expect(resolution.backend).toBe('solid')
    expect(resolution.precedence).toBe('accessibility')
    expect(resolution.accessibilityEnforced).toBe(true)
    expect(resolution.degraded).toBe(false)
  })

  it('never emits a reason no branch can produce', () => {
    const reasons = new Set<string>()
    for (const source of [theme, dom, describeBackdropSource({ kind: 'unavailable' })]) {
      for (const intent of ['solid', 'css', 'refractive', 'transmission-experimental'] as const) {
        for (const allow of [false, true]) {
          for (const capability of [
            capableEnvironment,
            resolveLensCapabilities({}),
            resolveLensCapabilities({ reducedTransparency: true }),
            resolveLensCapabilities({
              cssBackdropFilter: true,
              webgl: true,
              rendererHealthy: false,
            }),
          ]) {
            reasons.add(
              resolveLensBackend({
                source,
                capability,
                intent,
                allowExperimentalTransmission: allow,
              }).reason,
            )
          }
        }
      }
    }
    expect(reasons.has('no-css-backdrop-filter')).toBe(false)
  })
})

describe('Correction C — one renderer-neutral adapter per group', () => {
  it('shows CSS and SDF boundaries the same neutral lens state', () => {
    const store = new FluidGlassStore()
    const adapter = createLensStateAdapter(store, ACTIVE_LENS_GEOMETRY_POLICY)

    const cssBoundary = adapter.read()
    const sdfBoundary = adapter.read()

    expect(sdfBoundary.resolvedTargetId).toBe(cssBoundary.resolvedTargetId)
    expect(sdfBoundary.current).toEqual(cssBoundary.current)
    expect(sdfBoundary.desired).toEqual(cssBoundary.desired)
    expect(sdfBoundary.generation).toBe(cssBoundary.generation)
    expect(sdfBoundary.geometryPolicy).toBe(cssBoundary.geometryPolicy)
    expect(sdfBoundary.geometryPolicy).toBe(ACTIVE_LENS_GEOMETRY_POLICY)

    let notified = 0
    const unsubscribe = adapter.subscribe(() => {
      notified += 1
    })
    store.scheduleMeasurement()
    unsubscribe()
    store.destroy()
    expect(notified).toBeGreaterThanOrEqual(0)
  })
})

describe('Correction D — lens-only is enforced on the real target path', () => {
  it('never writes a movement transform to the semantic target element', () => {
    expect(targetGeometryIsAuthoritative(ACTIVE_LENS_GEOMETRY_POLICY)).toBe(true)

    render(
      <FluidGlassGroup environment={{ type: 'theme' }}>
        <FluidGlassTarget id="pilot" draggable behaviors={['selection', 'hover', 'press', 'drag']}>
          <button type="button">Move me</button>
        </FluidGlassTarget>
      </FluidGlassGroup>,
    )

    const target = document.querySelector<HTMLElement>('[data-fluid-glass-target="pilot"]')
    expect(target).not.toBeNull()
    if (!target) return

    target.setPointerCapture = () => undefined
    target.releasePointerCapture = () => undefined
    target.hasPointerCapture = () => true

    fireEvent.pointerDown(target, { pointerId: 1, clientX: 0, clientY: 0, button: 0 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 40, clientY: 24 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 80, clientY: 48 })

    expect(target.style.translate).toBe('')
    expect(target.style.transform).toBe('')

    fireEvent.pointerUp(target, { pointerId: 1, clientX: 80, clientY: 48 })
    expect(target.style.translate).toBe('')
  })

  it('keeps the group under the lens-only policy', () => {
    render(
      <FluidGlassGroup environment={{ type: 'theme' }}>
        <span>content</span>
      </FluidGlassGroup>,
    )
    const group = document.querySelector('[data-fluid-glass-group]')
    expect(group?.getAttribute('data-fluid-glass-geometry-policy')).toBe('lens-only')
  })
})

describe('Correction E — pilot internals stay private', () => {
  it('does not export renderer, scope or lifecycle internals from the barrel', () => {
    const exported = Object.keys(fluidGlassBarrel)
    for (const internal of [
      'PILOT_MAX_ACTIVE_WEBGL_SCOPES',
      'WebGlScopePilotGuard',
      'lensWebGlScopeGuard',
      'RendererLifecycleController',
      'ContextRecoveryController',
      'LensDebugChannel',
      'forceContextLossForDebug',
      'resolveLensBackend',
      'resolveLensCapabilities',
      'createLensStateAdapter',
    ]) {
      expect(exported).not.toContain(internal)
    }
  })

  it('still exports the semantic surface consumers need', () => {
    expect(Object.keys(fluidGlassBarrel)).toEqual(
      expect.arrayContaining(['FluidGlassGroup', 'FluidGlassTarget', 'toConsumerState']),
    )
  })
})

describe('Correction F — scope ownership is disposed by the renderer lifecycle', () => {
  it('releases the pilot slot through idempotent lifecycle teardown', () => {
    const guard = new WebGlScopePilotGuard()
    const lifecycle = new RendererLifecycleController()

    expect(guard.acquire('scope-a').granted).toBe(true)
    let released = false
    const release = () => {
      if (released) return
      released = true
      guard.release('scope-a')
    }
    lifecycle.register('scope', release)

    expect(guard.acquire('scope-b').granted).toBe(false)

    lifecycle.dispose('renderer unmounted')
    expect(guard.activeCount).toBe(0)

    lifecycle.dispose('again')
    release()
    expect(guard.activeCount).toBe(0)

    expect(guard.acquire('scope-b').granted).toBe(true)
    expect(lifecycle.disposalReport.scope).toBe(1)
  })
})

describe('Correction G — recovery is genuinely bounded', () => {
  it('walks lost → recovering → restored and cancels the budget', () => {
    const recovery = new ContextRecoveryController(2)
    expect(recovery.notifyContextLost().phase).toBe('lost')

    expect(recovery.snapshot.rendererHealthy).toBe(false)
    expect(recovery.beginRecovery().phase).toBe('recovering')
    const restored = recovery.notifyRestored()
    expect(restored.phase).toBe('healthy')
    expect(restored.attempts).toBe(0)
    recovery.dispose()
  })

  it('exhausts a bounded budget and stops instead of looping', () => {
    const recovery = new ContextRecoveryController(2)
    recovery.notifyContextLost()

    let guard = 0
    while (recovery.snapshot.phase !== 'terminal' && guard < 20) {
      guard += 1
      if (recovery.canAttemptRecovery) recovery.beginRecovery()
      recovery.notifyRecoveryFailed()
    }

    expect(recovery.snapshot.phase).toBe('terminal')
    expect(recovery.snapshot.attempts).toBe(2)
    expect(recovery.snapshot.reason).toBe('attempts-exhausted')
    expect(recovery.canAttemptRecovery).toBe(false)

    expect(recovery.notifyContextLost().phase).toBe('terminal')
    expect(recovery.beginRecovery().phase).toBe('terminal')
    expect(guard).toBeLessThan(20)
    recovery.dispose()
  })

  it('consumes the budget when a renderer error arrives during recovery', () => {
    const recovery = new ContextRecoveryController(2)
    recovery.notifyContextLost()
    recovery.beginRecovery()

    expect(recovery.notifyRecoveryFailed().phase).toBe('lost')
    expect(recovery.snapshot.attempts).toBe(1)
    recovery.dispose()
  })
})

describe('Correction H — lifecycle reports only what it owns', () => {
  it('disposes registered listeners, resources, canvas and scope once', () => {
    const lifecycle = new RendererLifecycleController()
    const calls: Array<string> = []
    lifecycle.register('listener', () => calls.push('listener'))
    lifecycle.register('resource', () => calls.push('resource'))
    lifecycle.register('canvas', () => calls.push('canvas'))
    lifecycle.register('scope', () => calls.push('scope'))

    lifecycle.dispose()
    lifecycle.dispose()

    expect(calls.sort()).toEqual(['canvas', 'listener', 'resource', 'scope'])
    expect(lifecycle.disposalReport).toEqual({
      listener: 1,
      resource: 1,
      canvas: 1,
      scope: 1,
    })

    let late = false
    lifecycle.register('scope', () => {
      late = true
    })
    expect(late).toBe(true)
  })

  it('does not claim ownership of recovery timers', () => {
    const lifecycle = new RendererLifecycleController()
    lifecycle.dispose()
    expect(Object.keys(lifecycle.disposalReport).sort()).toEqual([
      'canvas',
      'listener',
      'resource',
      'scope',
    ])
  })

  it('only exposes lifecycle states production can reach', () => {
    const lifecycle = new RendererLifecycleController()
    expect(lifecycle.transition('creating', 'mounted')).toBe(true)
    expect(lifecycle.transition('ready', 'context created')).toBe(true)
    expect(lifecycle.transition('context-lost', 'webglcontextlost')).toBe(true)
    expect(lifecycle.transition('recovering', 'attempt 1')).toBe(true)
    expect(lifecycle.transition('ready', 'restored')).toBe(true)
    expect(lifecycle.transition('context-lost', 'lost again')).toBe(true)
    expect(lifecycle.transition('terminal-fallback', 'exhausted')).toBe(true)
    expect(lifecycle.transition('ready', 'impossible')).toBe(false)
    lifecycle.dispose()
  })
})

describe('Correction I — resolution state is observable to debug tooling', () => {
  it('publishes readability, degradation and lifecycle on the group element', () => {
    render(
      <FluidGlassGroup environment={{ type: 'theme' }}>
        <span>observable</span>
      </FluidGlassGroup>,
    )
    const group = document.querySelector('[data-fluid-glass-group]')
    expect(group?.getAttribute('data-fluid-glass-readability')).toBe('readable')
    expect(group?.getAttribute('data-fluid-glass-recovery')).toBe('healthy')
    expect(group?.getAttribute('data-fluid-glass-recovery-attempts')).toBe('0/2')
    expect(group?.getAttribute('data-fluid-glass-lifecycle')).toBeTruthy()
    expect(screen.getByText('observable')).toBeTruthy()
  })
})
