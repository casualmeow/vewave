import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { LensCapabilitySnapshot } from '@/components/fluid-glass/lens/capability'
import { FLUID_GLASS_MATERIAL_PRESETS } from '@/components/fluid-glass/constants'
import { describeBackdropSource } from '@/components/fluid-glass/lens/backdrop-source'
import { resolveLensBackend } from '@/components/fluid-glass/lens/backend-resolution'
import {
  formatLensPaneDebug,
  type LensPaneDebugSnapshot,
} from '@/components/fluid-glass/lens/pane-debug'
import {
  LensLaboratoryScopeProvider,
  useLensScopeGuard,
} from '@/components/fluid-glass/lens/scope-context'
import {
  lensWebGlScopeGuard,
  WebGlScopePilotGuard,
} from '@/components/fluid-glass/lens/webgl-scope-guard'
import { FluidGlassFallbackLens } from '@/components/fluid-glass/ui/fallback-lens'

const capableEnvironment: LensCapabilitySnapshot = {
  webgl: true,
  advancedEffectsAllowed: true,
  reducedMotion: false,
  reducedTransparency: false,
  cssBackdropBlur: true,
  rendererHealthy: true,
  webglScopeAvailable: true,
  webglUsable: true,
  nativeSvgRefraction: false,
  notes: [],
}

function GuardProbe({ onGuard }: { onGuard: (guard: WebGlScopePilotGuard) => void }) {
  onGuard(useLensScopeGuard())
  return null
}

describe('Phase 4.2 — laboratory ownership isolation', () => {
  it('gives the laboratory an unbounded policy while production keeps one slot', () => {
    let laboratory: WebGlScopePilotGuard | null = null
    render(
      <LensLaboratoryScopeProvider>
        <GuardProbe
          onGuard={(guard) => {
            laboratory = guard
          }}
        />
      </LensLaboratoryScopeProvider>,
    )

    const guard = laboratory as unknown as WebGlScopePilotGuard
    expect(guard).not.toBe(lensWebGlScopeGuard)
    expect(guard.ownershipClass).toBe('laboratory')

    for (const pane of ['transmission-a', 'transmission-b', 'transmission-c']) {
      expect(guard.acquire(pane).granted).toBe(true)
    }
    expect(guard.acquire('sdf-late').granted).toBe(true)
    expect(guard.acquire('sdf-late').reason).toBe('already-owner')

    expect(lensWebGlScopeGuard.ownershipClass).toBe('production')
    expect(lensWebGlScopeGuard.maxActiveScopes).toBe(1)
    expect(lensWebGlScopeGuard.activeCount).toBe(0)
  })

  it('releases every laboratory slot on unmount', () => {
    let laboratory: WebGlScopePilotGuard | null = null
    const view = render(
      <LensLaboratoryScopeProvider>
        <GuardProbe
          onGuard={(guard) => {
            laboratory = guard
          }}
        />
      </LensLaboratoryScopeProvider>,
    )
    const guard = laboratory as unknown as WebGlScopePilotGuard
    guard.acquire('pane-1')
    guard.acquire('pane-2')
    expect(guard.activeCount).toBe(2)

    view.unmount()

    expect(guard.activeCount).toBe(0)
    expect(guard.ownerId).toBeNull()
    expect(lensWebGlScopeGuard.activeCount).toBe(0)
  })

  it('still honours an explicit budget so a starved laboratory stays testable', () => {
    const starved = new WebGlScopePilotGuard(1, 'laboratory')
    expect(starved.acquire('first').granted).toBe(true)
    expect(starved.acquire('second')).toMatchObject({
      granted: false,
      reason: 'scope-limit-reached',
    })
  })
})

describe('Phase 4.2 — truthful comparison state', () => {
  const snapshot: LensPaneDebugSnapshot = {
    requestedRenderer: 'auto',
    resolvedBackend: 'sdf',
    legacyBackend: 'sdf',
    reason: 'eligible-controlled-source',
    degraded: false,
    accessibilityEnforced: false,
    sourceCategory: 'controlled-readable',
    sourceReadability: 'readable',
    scopeId: 'tabs',
    ownsScope: true,
    scopeDenialReason: null,
    scopeOwnerId: 'tabs',
    ownershipClass: 'laboratory',
    lifecycleState: 'ready',
    recoveryPhase: 'healthy',
  }

  it('publishes requested, resolved, reason, readability and coordinator class', () => {
    const formatted = formatLensPaneDebug(snapshot)
    expect(formatted).toContain('requested: auto')
    expect(formatted).toContain('resolved: sdf')
    expect(formatted).toContain('reason: eligible-controlled-source')
    expect(formatted).toContain('readability: readable')
    expect(formatted).toContain('coordinator: laboratory')
  })

  it('does not resolve a readable controlled source to CSS once a slot is free', () => {
    const source = describeBackdropSource(
      { kind: 'image', src: 'data:image/png;base64,AA' },
      'readable',
    )
    expect(source.textureEligible).toBe(true)

    expect(
      resolveLensBackend({ source, capability: capableEnvironment, intent: 'refractive' }).backend,
    ).toBe('sdf')
    expect(
      resolveLensBackend({
        source,
        capability: capableEnvironment,
        intent: 'transmission-experimental',
        allowExperimentalTransmission: true,
      }).backend,
    ).toBe('transmission-experimental')
  })

  it('reports the scope refusal rather than silently downgrading', () => {
    const source = describeBackdropSource(
      { kind: 'image', src: 'data:image/png;base64,AA' },
      'readable',
    )
    const starved = { ...capableEnvironment, webglScopeAvailable: false }
    const resolved = resolveLensBackend({ source, capability: starved, intent: 'refractive' })

    expect(resolved.backend).not.toBe('sdf')
    expect(resolved.reason).toBe('webgl-scope-unavailable')

    expect(resolved.degraded).toBe(true)
  })
})

describe('Phase 4.2 — material corrections', () => {
  const expressive = FLUID_GLASS_MATERIAL_PRESETS.expressive

  it('keeps a legible rim band on a small capsule', () => {
    const smallestTargetHeight = 40
    expect(expressive.rimWidthRatio * smallestTargetHeight).toBeGreaterThanOrEqual(1.5)
    expect(expressive.minimumEdgeWidth).toBeGreaterThanOrEqual(3)

    expect(expressive.rimIntensity).toBeLessThanOrEqual(0.6)

    expect(expressive.shadowStrength).toBeLessThanOrEqual(0.34)
  })

  it('keeps the CSS fallback translucent instead of an opaque white body', () => {
    const { container } = render(
      <FluidGlassFallbackLens
        backend="css-approximation"
        reason="intent-css"
        material={expressive}
        lightDirection={[0.4, 0.8]}
      />,
    )

    const style =
      container.querySelector('[data-fluid-glass-material-body]')?.getAttribute('style') ?? ''

    const body = /background:([^;]+)/.exec(style)?.[1] ?? ''
    const fillWeights = [...body.matchAll(/var\(--glass-background\) ([\d.]+)%/g)].map(
      (match) => Number(match[1]) / 100,
    )
    expect(fillWeights).toHaveLength(3)
    expect(Math.max(...fillWeights)).toBeLessThan(0.25)

    expect(style).not.toContain('var(--card)')
    expect(body).not.toMatch(/rgb\(255 255 255\)/)
  })

  it('still resolves reduced transparency to a solid body', () => {
    const { container } = render(
      <FluidGlassFallbackLens
        backend="solid"
        reason="reduced-transparency"
        material={expressive}
        lightDirection={[0.4, 0.8]}
      />,
    )
    expect(
      container.querySelector('[data-fluid-glass-material-body="solid"]')?.getAttribute('style'),
    ).toContain('var(--card)')
  })

  it('never renders the CSS approximation with the solid body recipe', () => {
    const { container } = render(
      <FluidGlassFallbackLens
        backend="css-approximation"
        reason="intent-css"
        material={expressive}
        lightDirection={[0.4, 0.8]}
      />,
    )
    const lens = container.querySelector('[data-fluid-glass-fallback-lens="css-approximation"]')
    const style =
      lens?.querySelector('[data-fluid-glass-material-body]')?.getAttribute('style') ?? ''

    expect(style).not.toContain('var(--card)')
    expect(style).toContain('linear-gradient')

    expect(lens?.querySelector('[data-fluid-glass-fallback-layer="rim"]')).not.toBeNull()
    expect(lens?.querySelector('[data-fluid-glass-fallback-layer="sheen"]')).not.toBeNull()
  })
})

describe('Phase 4.3 — shader source parity', () => {
  it('keeps the authored .frag identical to the runtime template body', async () => {
    const { readFileSync } = await import('node:fs')
    const base = 'src/components/fluid-glass/shaders/fluid-glass.frag'
    const runtimeModule = readFileSync(`${base}.ts`, 'utf8')
    const authored = readFileSync(base, 'utf8')

    const start = runtimeModule.indexOf('`')
    const end = runtimeModule.lastIndexOf('`')
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const runtimeBody = runtimeModule.slice(start + 1, end)

    expect(runtimeBody).not.toMatch(/\$\{/)

    const normalize = (source: string) => source.replace(/\s+/g, ' ').trim()
    expect(normalize(authored)).toBe(normalize(runtimeBody))
  })
})
