import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { FluidGlassStore } from '@/components/fluid-glass/renderer/store'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { useFluidGlassStore } from '@/components/fluid-glass/context/fluid-glass-context'

class ResizeObserverHarness {
  static instances: Array<ResizeObserverHarness> = []

  readonly elements = new Set<Element>()

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverHarness.instances.push(this)
  }

  observe(element: Element) {
    this.elements.add(element)
  }

  unobserve(element: Element) {
    this.elements.delete(element)
  }

  disconnect() {
    this.elements.clear()
  }

  flush(target: Element) {
    this.callback([{ target } as ResizeObserverEntry], this)
  }
}

let capturedStore: FluidGlassStore | null = null
let animationFrames: Array<FrameRequestCallback> = []

function StoreProbe() {
  capturedStore = useFluidGlassStore()
  return null
}

function MultiScopeTopology({ broadcastRevision }: { broadcastRevision: number }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scene'>('overview')

  return (
    <FluidGlassGroup activation="always" forceFallback simulateReducedMotion>
      <FluidGlassTarget id="showcase-broadcast" scopeId="sidebar" active asChild>
        <button type="button" data-revision={broadcastRevision}>
          Broadcasts
        </button>
      </FluidGlassTarget>

      <div role="tablist" aria-label="Scoped tabs">
        <FluidGlassTarget
          id="showcase-tab-overview"
          scopeId="tabs"
          active={activeTab === 'overview'}
          asChild
        >
          <button type="button" role="tab" onClick={() => setActiveTab('overview')}>
            Overview
          </button>
        </FluidGlassTarget>
        <FluidGlassTarget
          id="showcase-tab-scene"
          scopeId="tabs"
          active={activeTab === 'scene'}
          asChild
        >
          <button type="button" role="tab" onClick={() => setActiveTab('scene')}>
            Scene Library
          </button>
        </FluidGlassTarget>
      </div>

      <div data-testid="outside">Outside targets</div>
      <StoreProbe />
    </FluidGlassGroup>
  )
}

describe('fluid glass multi-scope ownership topology', () => {
  beforeEach(() => {
    capturedStore = null
    animationFrames = []
    ResizeObserverHarness.instances = []
    vi.stubGlobal('ResizeObserver', ResizeObserverHarness)
    vi.stubGlobal('matchMedia', (query: string) => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps sidebar membership without allowing its rerender or measurement to reclaim tabs', async () => {
    const { rerender } = render(<MultiScopeTopology broadcastRevision={0} />)
    const broadcast = screen.getByRole('button', { name: 'Broadcasts' })
    const overview = screen.getByRole('tab', { name: 'Overview' })
    const scene = screen.getByRole('tab', { name: 'Scene Library' })
    const outside = screen.getByTestId('outside')

    expect(capturedStore?.activeTargetsByScope).toEqual({
      sidebar: 'showcase-broadcast',
      tabs: 'showcase-tab-overview',
    })
    expect(capturedStore?.currentLensScopeId).toBe('sidebar')
    expect(capturedStore?.resolvedTarget?.id).toBe('showcase-broadcast')

    await act(async () => {
      fireEvent.pointerDown(scene)
      fireEvent.pointerUp(scene)
      fireEvent.click(scene)
      await Promise.resolve()
    })

    expect(capturedStore?.activeTargetsByScope).toEqual({
      sidebar: 'showcase-broadcast',
      tabs: 'showcase-tab-scene',
    })
    expect(capturedStore?.currentLensScopeId).toBe('tabs')
    expect(capturedStore?.resolvedTarget?.id).toBe('showcase-tab-scene')

    rerender(<MultiScopeTopology broadcastRevision={1} />)
    Object.defineProperty(broadcast, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ bottom: 44, height: 44, left: 0, right: 160, top: 0, width: 160 }),
    })

    act(() => {
      animationFrames = []
      capturedStore?.measureNow()
      for (const observer of ResizeObserverHarness.instances) {
        if (observer.elements.has(broadcast)) observer.flush(broadcast)
      }
      const frame = animationFrames.shift()
      frame?.(performance.now())
    })

    fireEvent.pointerOver(overview)
    animationFrames = []
    fireEvent.pointerOut(overview, { relatedTarget: outside })
    act(() => {
      const frame = animationFrames.shift()
      frame?.(performance.now())
      const nextFrame = animationFrames.shift()
      nextFrame?.(performance.now() + 16)
    })

    expect(capturedStore?.activeTargetsByScope).toEqual({
      sidebar: 'showcase-broadcast',
      tabs: 'showcase-tab-scene',
    })
    expect(capturedStore?.currentLensScopeId).toBe('tabs')
    expect(capturedStore?.resolvedTarget?.id).toBe('showcase-tab-scene')
    expect(capturedStore?.telemetry.getTransitionSnapshot()).toMatchObject({
      currentScopeId: 'tabs',
      resolvedTargetId: 'showcase-tab-scene',
    })
  })
})
