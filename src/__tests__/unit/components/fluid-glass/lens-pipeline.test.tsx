import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RendererLifecycleController } from '@/components/fluid-glass/lens/renderer-lifecycle'

type RendererHarness = {
  lifecycle: RendererLifecycleController
  contextLost: () => void
  fail: () => void
  listener: ReturnType<typeof vi.fn>
  resource: ReturnType<typeof vi.fn>
  canvas: ReturnType<typeof vi.fn>
}

const mounted: Array<RendererHarness> = []

const control = vi.hoisted(() => ({ withholdReadiness: false }))

vi.mock('@/components/fluid-glass/lens/capability', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  probeWebglSupport: () => true,
  probeCssBackdropFilterSupport: () => true,
}))

vi.mock('@/components/fluid-glass/renderer/fluid-glass-renderer', async () => {
  const { useEffect } = await import('react')

  return {
    FluidGlassRenderer: ({
      lifecycle,
      onContextLost,
      onFailure,
      onReady,
    }: {
      lifecycle: RendererLifecycleController
      onContextLost: () => void
      onFailure: () => void
      onReady: () => void
    }) => {
      useEffect(() => {
        const harness: RendererHarness = {
          lifecycle,
          contextLost: onContextLost,
          fail: onFailure,
          listener: vi.fn(),
          resource: vi.fn(),
          canvas: vi.fn(),
        }
        mounted.push(harness)

        lifecycle.transition('creating', 'stub renderer mounted')
        lifecycle.register('listener', harness.listener)
        lifecycle.register('resource', harness.resource)
        lifecycle.register('canvas', harness.canvas)
        if (!control.withholdReadiness) {
          lifecycle.transition('ready', 'stub context created')
          onReady()
        }

        return () => lifecycle.dispose('stub renderer unmounted')
      }, [lifecycle, onContextLost, onFailure, onReady])

      return <div data-fluid-glass-canvas="stub" />
    },
  }
})

const { FluidGlassGroup, FluidGlassTarget } = await import('@/components/fluid-glass')
const { lensWebGlScopeGuard } = await import('@/components/fluid-glass/lens/webgl-scope-guard')

function Group(props: { environment?: Parameters<typeof FluidGlassGroup>[0]['environment'] }) {
  return (
    <FluidGlassGroup activation="always" environment={props.environment ?? { type: 'theme' }}>
      <FluidGlassTarget id="a" active>
        <button type="button">A</button>
      </FluidGlassTarget>
    </FluidGlassGroup>
  )
}

function groupNode(container: HTMLElement) {
  const node = container.querySelector<HTMLElement>('[data-fluid-glass-group]')
  if (!node) throw new Error('group not rendered')
  return node
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  mounted.length = 0
  lensWebGlScopeGuard.reset()
  document.documentElement.dataset.surfaceStyle = 'glass'
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

afterEach(() => {
  control.withholdReadiness = false
  lensWebGlScopeGuard.reset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function stubImageReadability(readable: boolean) {
  vi.stubGlobal(
    'Image',
    class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin: string | null = null
      set src(_value: string) {
        queueMicrotask(() => (readable ? this.onload?.() : this.onerror?.()))
      }
    },
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  } as unknown as CanvasRenderingContext2D)
}

async function flushProbe() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('source-dependent backend resolution through the group', () => {
  it('keeps an image with unproven readability off the WebGL path', () => {
    const { container } = render(<Group environment={{ type: 'image', src: '/local.png' }} />)
    const node = groupNode(container)

    expect(node.dataset.fluidGlassReadability).toBe('unknown')
    expect(node.dataset.fluidGlassResolvedBackend).not.toBe('sdf')
    expect(node.dataset.fluidGlassBackend).toBe('css')
    expect(node.dataset.fluidGlassReason).toBe('source-readability-unknown')
  })

  it('resolves a confirmed readable controlled image source to SDF', async () => {
    stubImageReadability(true)
    const { container } = render(<Group environment={{ type: 'image', src: '/local.png' }} />)
    await flushProbe()

    const node = groupNode(container)
    expect(node.dataset.fluidGlassReadability).toBe('readable')
    expect(node.dataset.fluidGlassResolvedBackend).toBe('sdf')
    expect(node.dataset.fluidGlassBackend).toBe('sdf')
    expect(node.dataset.fluidGlassSource).toBe('controlled-readable')
    expect(node.dataset.fluidGlassReason).toBe('eligible-controlled-source')
  })

  it('keeps an image whose load fails on a non-WebGL backend', async () => {
    stubImageReadability(false)
    const { container } = render(<Group environment={{ type: 'image', src: '/missing.png' }} />)
    await flushProbe()

    const node = groupNode(container)
    expect(node.dataset.fluidGlassReadability).toBe('failed')
    expect(node.dataset.fluidGlassBackend).toBe('css')
    expect(node.dataset.fluidGlassReason).toBe('source-unreadable')
  })

  it('resolves an arbitrary DOM backdrop to a CSS approximation, never WebGL', () => {
    const { container } = render(<Group environment={{ type: 'auto-dom' }} />)
    const node = groupNode(container)

    expect(node.dataset.fluidGlassResolvedBackend).toBe('css-approximation')
    expect(node.dataset.fluidGlassBackend).toBe('css')
    expect(node.dataset.fluidGlassSource).toBe('arbitrary-dom')

    expect(node.dataset.fluidGlassReason).toBe('arbitrary-dom-cannot-use-webgl')
    expect(mounted).toHaveLength(0)
  })

  it('reports the lens-only pilot geometry policy', () => {
    const { container } = render(<Group />)

    expect(groupNode(container).dataset.fluidGlassGeometryPolicy).toBe('lens-only')
  })
})

describe('one active WebGL scope pilot guard', () => {
  it('downgrades a second simultaneous scope with a reason', () => {
    const { container } = render(
      <div>
        <Group />
        <Group />
      </div>,
    )
    const groups = container.querySelectorAll<HTMLElement>('[data-fluid-glass-group]')

    expect(groups[0].dataset.fluidGlassResolvedBackend).toBe('sdf')
    expect(groups[1].dataset.fluidGlassResolvedBackend).toBe('css-approximation')
    expect(groups[1].dataset.fluidGlassReason).toBe('webgl-scope-unavailable')
    expect(lensWebGlScopeGuard.activeCount).toBe(1)
  })

  it('lets a waiting scope acquire the slot once the owner is disposed', () => {
    const first = render(<Group />)
    const second = render(<Group />)

    expect(groupNode(second.container).dataset.fluidGlassResolvedBackend).toBe('css-approximation')

    act(() => first.unmount())

    expect(groupNode(second.container).dataset.fluidGlassResolvedBackend).toBe('sdf')
    expect(lensWebGlScopeGuard.activeCount).toBe(1)
  })

  it('releases the slot through unmount so nothing leaks between scopes', () => {
    const { unmount } = render(<Group />)
    expect(lensWebGlScopeGuard.activeCount).toBe(1)

    act(() => unmount())

    expect(lensWebGlScopeGuard.activeCount).toBe(0)
  })
})

describe('context loss and bounded recovery', () => {
  it('falls back to CSS immediately on context loss', () => {
    const { container } = render(<Group />)

    act(() => mounted[0].contextLost())

    const node = groupNode(container)
    expect(node.dataset.fluidGlassBackend).toBe('css')
    expect(node.dataset.fluidGlassReason).toBe('renderer-failure')
  })

  it('restores SDF after a successful bounded recovery', async () => {
    const { container } = render(<Group />)

    act(() => mounted[0].contextLost())
    expect(groupNode(container).dataset.fluidGlassRecovery).toBe('lost')

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(mounted.length).toBeGreaterThan(1)
    expect(groupNode(container).dataset.fluidGlassResolvedBackend).toBe('sdf')
    expect(groupNode(container).dataset.fluidGlassRecovery).toBe('healthy')
  })

  it('spends the budget on renderer errors instead of jumping to terminal', async () => {
    control.withholdReadiness = true
    const { container } = render(<Group />)

    act(() => mounted[0].fail())
    expect(groupNode(container).dataset.fluidGlassRecovery).toBe('lost')

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(groupNode(container).dataset.fluidGlassRecovery).toBe('recovering')
    expect(groupNode(container).dataset.fluidGlassRecoveryAttempts).toBe('1/2')
    expect(mounted.length).toBe(2)
  })

  it('reaches terminal fallback once the bounded budget is exhausted', async () => {
    control.withholdReadiness = true
    const { container } = render(<Group />)

    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (groupNode(container).dataset.fluidGlassRecovery === 'terminal') break
      act(() => mounted[mounted.length - 1].fail())
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    }

    const node = groupNode(container)
    expect(node.dataset.fluidGlassRecovery).toBe('terminal')
    expect(node.dataset.fluidGlassBackend).toBe('css')
    expect(node.dataset.fluidGlassReason).toBe('renderer-failure')
    expect(node.dataset.fluidGlassRecoveryAttempts).toBe('2/2')

    expect(mounted.length).toBeLessThanOrEqual(3)
    const rendererCount = mounted.length
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(mounted).toHaveLength(rendererCount)
  })
})

describe('renderer lifecycle disposal', () => {
  it('releases renderer-owned listeners, resources and canvas references', () => {
    const { unmount } = render(<Group />)
    const harness = mounted[0]

    act(() => unmount())

    expect(harness.listener).toHaveBeenCalledTimes(1)
    expect(harness.resource).toHaveBeenCalledTimes(1)
    expect(harness.canvas).toHaveBeenCalledTimes(1)
    expect(harness.lifecycle.state).toBe('disposed')
    expect(harness.lifecycle.disposalReport).toMatchObject({
      listener: 1,
      resource: 1,
      canvas: 1,
    })
  })

  it('is safe when disposal runs again after unmount', () => {
    const { unmount } = render(<Group />)
    const harness = mounted[0]

    act(() => unmount())
    harness.lifecycle.dispose()

    expect(harness.listener).toHaveBeenCalledTimes(1)
  })
})
