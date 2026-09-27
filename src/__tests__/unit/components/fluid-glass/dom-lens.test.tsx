import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { FluidGlassStore } from '@/components/fluid-glass/renderer/store'
import type * as LensCapabilities from '@/components/fluid-glass/lens/capability'
import type * as LiquidGlass from '@/shared/lib/liquid-glass'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { useBackdropReadability } from '@/components/fluid-glass/hooks/use-backdrop-readability'
import { useFluidGlassStore } from '@/components/fluid-glass/context/fluid-glass-context'
import { describeBackdropSource } from '@/components/fluid-glass/lens/backdrop-source'
import { resolveLensBackend } from '@/components/fluid-glass/lens/backend-resolution'
import { resolveLensCapabilities } from '@/components/fluid-glass/lens/capability'
import { createEdgeDisplacementMap } from '@/shared/lib/liquid-glass'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

const probes = vi.hoisted(() => ({ native: true, webgl: vi.fn(() => true) }))
vi.mock('@/components/fluid-glass/lens/capability', async (load) => ({
  ...(await load<typeof LensCapabilities>()),
  probeNativeSvgRefractionSupport: () => probes.native,
  probeCssBackdropFilterSupport: () => true,
  probeWebglSupport: probes.webgl,
}))
vi.mock('@/shared/lib/liquid-glass', async (load) => ({
  ...(await load<typeof LiquidGlass>()),
  createEdgeDisplacementMap: vi.fn(() => 'data:image/png;base64,fixture'),
}))

let store: FluidGlassStore
function StoreProbe() {
  store = useFluidGlassStore()!
  return null
}
function Example({ active = 'a', reduced = false }: { active?: string; reduced?: boolean }) {
  return (
    <FluidGlassGroup environment={{ type: 'auto-dom' }} simulateReducedMotion={reduced}>
      <StoreProbe />
      {['a', 'b'].map((id) => (
        <FluidGlassTarget key={id} id={id} active={id === active} asChild>
          <button type="button">{id}</button>
        </FluidGlassTarget>
      ))}
    </FluidGlassGroup>
  )
}
const group = () => document.querySelector<HTMLElement>('[data-fluid-glass-group]')!
const carrier = () => document.querySelector<HTMLElement>('[data-fluid-glass-carrier]')!

beforeEach(() => {
  vi.useFakeTimers()
  probes.native = true
  probes.webgl.mockClear()
  vi.mocked(createEdgeDisplacementMap).mockClear()
  document.documentElement.dataset.surfaceStyle = 'glass'
  document.documentElement.dataset.glassRefraction = 'on'
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const x = this.dataset.fluidGlassTarget === 'b' ? 180 : 20
    return {
      x,
      y: 30,
      left: x,
      top: 30,
      right: x + 140,
      bottom: 70,
      width: 140,
      height: 40,
      toJSON() {},
    }
  })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete document.documentElement.dataset.surfaceStyle
  delete document.documentElement.dataset.glassRefraction
  delete document.documentElement.dataset.glassIntensity
})

describe('live DOM lens', () => {
  it('uses the shared optical intensity profile without changing the selected target', async () => {
    render(<Example reduced />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60)
    })
    const target = store.resolvedTarget?.id
    for (const intensity of ['subtle', 'balanced', 'strong'] as const) {
      await act(async () => {
        document.documentElement.dataset.glassIntensity = intensity
        await Promise.resolve()
        await vi.advanceTimersByTimeAsync(32)
      })
      const optical = resolveGlassMaterial({ mode: 'light', intensity, role: 'control' })
      expect(Number(document.querySelector('feDisplacementMap')?.getAttribute('scale'))).toBe(
        optical.displacement * 2,
      )
      expect(carrier().style.getPropertyValue('--glass-blur-base')).toBe(`${optical.centerBlur}px`)
      expect(Number(carrier().style.getPropertyValue('--lens-scattering'))).toBe(
        optical.edgeBlur / optical.centerBlur,
      )
      expect(store.resolvedTarget?.id).toBe(target)
      expect(probes.webgl).not.toHaveBeenCalled()
    }
  })

  it('uses unique SVG filters for simultaneous groups without probing or allocating WebGL', async () => {
    render(
      <>
        <Example />
        <Example />
      </>,
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
    })
    expect(
      [...document.querySelectorAll('[data-fluid-glass-group]')].map((node) =>
        node.getAttribute('data-fluid-glass-resolved-backend'),
      ),
    ).toEqual(['native-svg', 'native-svg'])
    const filters = [...document.querySelectorAll('filter')].map((node) => node.id)
    expect(new Set(filters).size).toBe(2)
    expect(document.querySelector('canvas')).toBeNull()
    expect(probes.webgl).not.toHaveBeenCalled()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('enables native optics without the legacy flag and preserves selection in Solid', async () => {
    render(<Example />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
    })
    const id = store.resolvedTarget?.id
    await act(async () => {
      document.documentElement.dataset.glassRefraction = 'off'
      await Promise.resolve()
    })
    expect(group().dataset.fluidGlassResolvedBackend).toBe('native-svg')
    expect(document.querySelector('filter')).not.toBeNull()
    expect(store.resolvedTarget?.id).toBe(id)
    await act(async () => {
      document.documentElement.dataset.surfaceStyle = 'solid'
      await Promise.resolve()
    })
    expect(group().dataset.fluidGlassResolvedBackend).toBe('solid')
    expect(document.querySelector('filter')).toBeNull()
    expect(store.resolvedTarget?.id).toBe(id)
  })

  it('falls back on unsupported browsers and displacement-map acquisition failure', async () => {
    probes.native = false
    const view = render(<Example />)
    expect(group().dataset.fluidGlassResolvedBackend).toBe('css-approximation')
    view.unmount()
    probes.native = true
    vi.mocked(createEdgeDisplacementMap).mockReturnValueOnce(null)
    render(<Example />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60)
    })
    expect(group().dataset.fluidGlassResolvedBackend).toBe('css-approximation')
    expect(screen.getByRole('button', { name: 'a' })).toBeTruthy()
  })

  it('draws the controller position, preserves hit areas and reuses maps during travel', async () => {
    const view = render(<Example />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60)
    })
    const count = vi.mocked(createEdgeDisplacementMap).mock.calls.length
    view.rerender(<Example active="b" />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(96)
    })
    expect(carrier().style.transform).toBe(
      `translate3d(${store.current.x}px, ${store.current.y}px, 0)`,
    )
    expect(store.current.x).toBeGreaterThan(0)
    expect(store.current.x).toBeLessThan(160)
    expect(carrier().style.opacity).toBe('')
    expect(document.querySelector('feImage')?.getAttribute('width')).toBe(
      String(store.current.width),
    )
    expect(screen.getByRole('button', { name: 'b' }).style.transform).toBe('')
    expect(vi.mocked(createEdgeDisplacementMap).mock.calls.length).toBe(count)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800)
    })
    expect(store.current.x).toBe(160)
    expect(store.current.scaleX).toBe(1)
    expect(store.scheduler.animationScheduled).toBe(false)
  })

  it('snaps geometry under reduced motion and returns from hover to selection', async () => {
    const view = render(<Example reduced />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60)
    })
    fireEvent.pointerOver(screen.getByRole('button', { name: 'b' }))
    expect(store.resolvedTarget?.id).toBe('b')
    fireEvent.pointerOut(screen.getByRole('button', { name: 'b' }), {
      relatedTarget: document.body,
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })
    expect(store.resolvedTarget?.id).toBe('a')
    view.rerender(<Example active="b" reduced />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })
    expect(store.current.x).toBe(160)
    expect(store.current.scaleX).toBe(1)
    expect(store.current.scaleY).toBe(1)
    expect(store.scheduler.animationScheduled).toBe(false)
  })

  it('preserves keyboard focus while the selected lens remeasures scrolling', async () => {
    const view = render(<Example reduced />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60)
    })
    const target = screen.getByRole('button', { name: 'b' })
    act(() => target.focus())
    expect(store.resolvedTarget?.id).toBe('a')
    view.rerender(<Example active="b" reduced />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 220,
      y: 30,
      left: 220,
      top: 30,
      right: 390,
      bottom: 70,
      width: 170,
      height: 40,
      toJSON() {},
    })
    fireEvent.scroll(window)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(32)
    })
    expect(store.current.x).toBe(200)
    expect(store.current.width).toBe(170)
    expect(document.querySelector('feImage')?.getAttribute('width')).toBe('170')
    expect(target.style.width).toBe('')
    expect(target.style.transform).toBe('')
    expect(document.activeElement).toBe(target)
  })

  it('ignores disabled targets and cancels scheduling on unmount', async () => {
    const view = render(
      <FluidGlassGroup environment={{ type: 'auto-dom' }}>
        <StoreProbe />
        <FluidGlassTarget id="enabled" active asChild>
          <button>Enabled</button>
        </FluidGlassTarget>
        <FluidGlassTarget id="disabled" disabled asChild>
          <button disabled>Disabled</button>
        </FluidGlassTarget>
      </FluidGlassGroup>,
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60)
    })
    fireEvent.pointerOver(screen.getByRole('button', { name: 'Disabled' }))
    expect(store.resolvedTarget?.id).toBe('enabled')
    view.unmount()
    expect(store.scheduler.animationScheduled).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('source readiness', () => {
  it.each(['unknown', 'failed', 'unreadable'] as const)(
    'keeps %s images off both WebGL paths',
    (readability) => {
      const source = describeBackdropSource({ kind: 'image', src: '/backdrop.png' }, readability)
      const capability = resolveLensCapabilities({
        cssBackdropFilter: true,
        webgl: true,
        advancedEffectsAllowed: true,
        webglScopeAvailable: true,
        rendererHealthy: true,
      })
      for (const intent of ['refractive', 'transmission-experimental'] as const) {
        expect(
          resolveLensBackend({ source, capability, intent, allowExperimentalTransmission: true })
            .backend,
        ).toBe('css-approximation')
      }
    },
  )

  it('withdraws source readiness synchronously when the source changes', () => {
    const { result, rerender } = renderHook(
      ({ image }) =>
        useBackdropReadability(image ? { type: 'image', src: '/new.png' } : { type: 'theme' }),
      { initialProps: { image: false } },
    )
    expect(result.current).toBe('readable')
    rerender({ image: true })
    expect(result.current).toBe('unknown')
  })
})
