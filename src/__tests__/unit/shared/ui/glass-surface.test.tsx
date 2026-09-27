import { createRef } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ModalGlassGeometry } from '@/shared/lib/modal-glass'
import type * as ModalGlassModule from '@/shared/lib/modal-glass'
import type * as ModalFluidModule from '@/shared/lib/modal-glass-fluid'
import { GlassSurface } from '@/shared/ui/glass-surface'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { createEdgeDisplacementMap } from '@/shared/lib/liquid-glass'
import { createModalGlassMaps, resolveModalGlassMaterial } from '@/shared/lib/modal-glass'
import { createModalFluidAnimator } from '@/shared/lib/modal-glass-fluid'
import { GlassInteractionScope } from '@/shared/lib/glass-interaction-scope'

const capabilities = vi.hoisted(() => ({
  native: true,
  reduced: false,
  reducedMotion: false,
  fine: false,
}))
vi.mock('@/shared/lib/liquid-glass', () => ({
  supportsLiquidGlassRefraction: () => capabilities.native,
  createEdgeDisplacementMap: vi.fn(() => 'data:image/png;base64,map'),
}))
vi.mock('@/shared/lib/modal-glass', async (importOriginal) => ({
  ...(await importOriginal<typeof ModalGlassModule>()),
  createModalGlassMaps: vi.fn((geometry: ModalGlassGeometry) => ({
    ...geometry,
    displacement: 'data:image/png;base64,refraction',
    mask: 'data:image/png;base64,mask',
    heightMap: 'data:image/png;base64,height',
    pointerField: 'data:image/png;base64,field',
  })),
}))
vi.mock('@/shared/lib/modal-glass-fluid', async (load) => {
  const original = await load<typeof ModalFluidModule>()
  return {
    ...original,
    createModalFluidAnimator: vi.fn(
      (_width, _height, publish: (href: string, active: boolean) => void) => ({
        impulse: vi.fn(() => publish('data:image/png;base64,flow', true)),
        reset: vi.fn(() => publish(original.neutralFluidMap, false)),
        dispose: vi.fn(() => publish(original.neutralFluidMap, false)),
      }),
    ),
  }
})
let resize: ResizeObserverCallback
const disconnect = vi.fn()
beforeEach(() => {
  capabilities.native = true
  capabilities.reduced = false
  capabilities.reducedMotion = false
  capabilities.fine = false
  vi.clearAllMocks()
  document.documentElement.dataset.surfaceStyle = 'glass'
  document.documentElement.dataset.glassRefraction = 'off'
  document.documentElement.dataset.glassMotion = 'fluid'
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback
      }
      observe() {}
      disconnect = disconnect
    },
  )
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches:
      (query.includes('reduced-transparency') && capabilities.reduced) ||
      (query.includes('reduced-motion') && capabilities.reducedMotion) ||
      (query.includes('pointer: fine') && capabilities.fine),
    addEventListener() {},
    removeEventListener() {},
  }))
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  delete document.documentElement.dataset.surfaceStyle
  delete document.documentElement.dataset.glassRefraction
  delete document.documentElement.dataset.glassCapability
  delete document.documentElement.dataset.glassMotion
  delete document.documentElement.dataset.glassIntensity
  delete document.documentElement.dataset.inputModality
  delete document.documentElement.dataset.resolvedMode
})

describe('GlassSurface composition', () => {
  it('gives an inline form the smoked material without dialog semantics or entrance classes', () => {
    document.documentElement.dataset.resolvedMode = 'dark'
    render(<GlassSurface role="form">Inline sign-in surface</GlassSurface>)
    const pane = screen.getByText('Inline sign-in surface')
    expect(pane.classList.contains('glass-role-form')).toBe(true)
    expect(pane.dataset.glassOptics).toBe('native')
    expect(Number.parseFloat(pane.style.getPropertyValue('--modal-glass-tint')) / 100).toBeCloseTo(
      resolveModalGlassMaterial('dark', 'balanced').centerTint,
    )
    expect(createModalGlassMaps).toHaveBeenCalled()
    expect(pane.hasAttribute('role')).toBe(false)
    expect(pane.hasAttribute('aria-modal')).toBe(false)
    expect(pane.classList.contains('dialog-presence')).toBe(false)
    expect(createModalFluidAnimator).not.toHaveBeenCalled()
  })

  it('keeps the inline form opaque in Solid without creating optical maps', () => {
    document.documentElement.dataset.surfaceStyle = 'solid'
    render(<GlassSurface role="form">Opaque sign-in surface</GlassSurface>)
    expect(screen.getByText('Opaque sign-in surface').dataset.glassOptics).toBe('solid')
    expect(createModalGlassMaps).not.toHaveBeenCalled()
  })

  it('updates the sibling SVG and pane together when changing to dark mode, without rebuilding geometry', async () => {
    document.documentElement.dataset.resolvedMode = 'light'
    render(<GlassSurface role="dialog">Smoked pane</GlassSurface>)
    const pane = screen.getByText('Smoked pane')
    const calls = vi.mocked(createModalGlassMaps).mock.calls.length
    expect(
      Number.parseFloat(pane.style.getPropertyValue('--modal-glass-tint')),
    ).toBeGreaterThanOrEqual(72)
    expect(Number.parseFloat(pane.style.getPropertyValue('--modal-glass-tint'))).toBeLessThan(94)
    await act(async () => {
      document.documentElement.dataset.resolvedMode = 'dark'
      await Promise.resolve()
    })
    const svg = document.querySelector('filter')!.closest('svg')!
    const tint = pane.style.getPropertyValue('--modal-glass-tint')
    expect(Number.parseFloat(tint) / 100).toBeCloseTo(
      resolveModalGlassMaterial('dark', 'balanced').centerTint,
    )
    expect(svg.style.getPropertyValue('--modal-glass-tint')).toBe(tint)
    const edge = Number(
      document.querySelector('[result="edge-tint"]')!.getAttribute('flood-opacity'),
    )
    const core = Number(
      document.querySelector('[result="center-tint"]')!.getAttribute('flood-opacity'),
    )
    expect(edge + core * (1 - edge)).toBeCloseTo(Number.parseFloat(tint) / 100)
    const tintScale = Number(
      document.querySelector('[result="tint-mask"] feFuncA')!.getAttribute('slope'),
    )

    const progress = 20 / 24
    expect(tintScale * progress * progress * (3 - 2 * progress)).toBeCloseTo(1)
    expect(document.querySelector('[result="weighted-tint"]')!.getAttribute('in2')).toBe(
      'tint-mask',
    )
    expect(document.querySelector('[result="fluid-light"]')).toBeNull()
    expect(createModalGlassMaps).toHaveBeenCalledTimes(calls)
  })

  it('keeps the smoked material on the CSS path when native optics are unavailable', () => {
    capabilities.native = false
    document.documentElement.dataset.resolvedMode = 'dark'
    document.documentElement.dataset.glassIntensity = 'subtle'
    render(<GlassSurface role="dialog">Fallback pane</GlassSurface>)
    const pane = screen.getByText('Fallback pane')
    expect(pane.dataset.glassOptics).toBe('css')
    expect(pane.style.getPropertyValue('--modal-glass-blur')).toBe('2px')
    expect(Number.parseFloat(pane.style.getPropertyValue('--modal-glass-tint')) / 100).toBeCloseTo(
      resolveModalGlassMaterial('dark', 'subtle').centerTint,
    )
    expect(document.querySelector('filter')).toBeNull()
  })
  it('preserves child refs and pointer handlers, measures its radius, and caches unchanged geometry', () => {
    vi.useFakeTimers()
    const outerRef = createRef<HTMLDivElement>()
    const childRef = createRef<HTMLButtonElement>()
    const onPointerDown = vi.fn()
    const view = render(
      <GlassSurface asChild ref={outerRef} role="control">
        <button
          ref={childRef}
          onPointerDown={onPointerDown}
          style={{ borderTopLeftRadius: '18px' }}
        >
          Control
        </button>
      </GlassSurface>,
    )
    const button = screen.getByRole('button', { name: 'Control' })
    expect(outerRef.current).toBe(button)
    expect(childRef.current).toBe(button)
    expect(button.dataset.glassOptics).toBe('native')
    expect(createEdgeDisplacementMap).toHaveBeenCalledWith({
      width: 300,
      height: 200,
      radius: 18,
      edgeWidth: 16,
    })
    fireEvent.pointerDown(button)
    expect(onPointerDown).toHaveBeenCalledTimes(1)
    const calls = vi.mocked(createEdgeDisplacementMap).mock.calls.length
    act(() => {
      resize([], {} as ResizeObserver)
      vi.advanceTimersByTime(150)
    })
    expect(createEdgeDisplacementMap).toHaveBeenCalledTimes(calls)
    view.unmount()
    expect(outerRef.current).toBeNull()
    expect(childRef.current).toBeNull()
    expect(disconnect).toHaveBeenCalled()
  })

  it('handles late Radix mounts, closes on Escape and returns focus', async () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <GlassInteractionScope>
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent ref={ref}>
            <DialogTitle>Preferences</DialogTitle>
            <DialogDescription>Change appearance</DialogDescription>
            <button>Option</button>
          </DialogContent>
        </Dialog>
      </GlassInteractionScope>,
    )
    expect(ref.current).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog', { name: 'Preferences' })
    expect(ref.current).toBe(dialog)
    expect(dialog.dataset.glassPresence).toBe('dialog')
    await waitFor(() => expect(dialog.dataset.glassOptics).toBe('native'))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Option' }))
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open' }))
    expect(ref.current).toBeNull()
  })

  it('never allocates a displacement map for the workspace shell or unsupported browsers', () => {
    const view = render(<GlassSurface role="shell">Workspace</GlassSurface>)
    expect(createEdgeDisplacementMap).not.toHaveBeenCalled()
    expect(createModalGlassMaps).not.toHaveBeenCalled()
    capabilities.native = false
    view.rerender(<GlassSurface role="dialog">Preferences</GlassSurface>)
    expect(createEdgeDisplacementMap).not.toHaveBeenCalled()
    expect(screen.getByText('Preferences').dataset.glassOptics).toBe('css')
  })

  it('disables native optics for reduced transparency and forced capability fallback', async () => {
    capabilities.reduced = true
    const view = render(<GlassSurface>Pane</GlassSurface>)
    expect(createEdgeDisplacementMap).not.toHaveBeenCalled()
    capabilities.reduced = false
    await act(async () => {
      document.documentElement.dataset.glassCapability = 'fallback'
      await Promise.resolve()
    })
    view.rerender(<GlassSurface>Pane</GlassSurface>)
    expect(createEdgeDisplacementMap).not.toHaveBeenCalled()
    expect(document.querySelector('filter')).toBeNull()
  })

  it('selects modal optics by role and intensity without filtering foreground content', () => {
    document.documentElement.dataset.glassIntensity = 'strong'
    render(
      <GlassSurface role="dialog" style={{ borderTopLeftRadius: '24px' }}>
        <button>Keep sharp</button>
      </GlassSurface>,
    )
    const button = screen.getByRole('button', { name: 'Keep sharp' })
    const pane = button.parentElement!
    expect(createEdgeDisplacementMap).not.toHaveBeenCalled()
    expect(createModalGlassMaps).toHaveBeenCalledWith({
      width: 300,
      height: 200,
      radius: 24,
      intensity: 'strong',
    })
    expect(pane.dataset.glassOptics).toBe('native')
    expect(pane.hasAttribute('data-glass-modal')).toBe(true)
    expect(pane.style.filter).toBe('')
    expect(pane.style.opacity).toBe('')
    expect(pane.style.getPropertyValue('--glass-refraction-filter')).not.toContain('blur(')
    expect(pane.querySelector('filter')).toBeNull()
    expect(
      document
        .querySelector('feGaussianBlur[result="frosted-center"]')
        ?.getAttribute('stdDeviation'),
    ).toBe('6')
    expect(
      document.querySelector('feGaussianBlur[result="clear-edge"]')?.getAttribute('stdDeviation'),
    ).toBe('1')
    expect(document.querySelectorAll('feDisplacementMap[in2="warp"]')).toHaveLength(2)
    expect(
      document.querySelector('feGaussianBlur[result="frosted-center"]')?.getAttribute('in'),
    ).toBe('SourceGraphic')
  })

  it.each(['menu', 'sheet'] as const)(
    'shares fixed-core native optics for scoped %s panels',
    (role) => {
      const view = render(<GlassSurface role={role}>Panel</GlassSurface>)
      expect(screen.getByText('Panel').hasAttribute('data-glass-modal')).toBe(false)
      expect(createModalGlassMaps).not.toHaveBeenCalled()
      view.rerender(
        <GlassInteractionScope>
          <GlassSurface role={role}>Panel</GlassSurface>
        </GlassInteractionScope>,
      )
      expect(screen.getByText('Panel').hasAttribute('data-glass-modal')).toBe(true)
      expect(document.querySelector('[result="core-mask"]')?.getAttribute('in')).toBe(
        'material-mask',
      )
      expect(document.querySelectorAll('feDisplacementMap[in2="warp"]')).toHaveLength(2)
    },
  )

  it('keeps native optics static outside the product scope', () => {
    vi.useFakeTimers()
    capabilities.fine = true
    vi.stubGlobal('PointerEvent', MouseEvent)
    render(
      <GlassSurface role="dialog" presence="dialog">
        Pane
      </GlassSurface>,
    )
    const pane = screen.getByText('Pane')
    fireEvent.pointerMove(pane, { clientX: 2, clientY: 100 })
    expect(pane.dataset.glassPresence).toBeUndefined()
    expect(pane.dataset.glassInteraction).toBeUndefined()
    expect(vi.getTimerCount()).toBe(0)
    expect(createModalFluidAnimator).not.toHaveBeenCalled()
  })

  it('bends only optical layers at the inner shoulder and stops while contact holds', async () => {
    vi.useFakeTimers()
    capabilities.fine = true
    vi.stubGlobal('PointerEvent', MouseEvent)
    const view = render(
      <GlassInteractionScope>
        <GlassSurface role="dialog" presence="dialog" data-state="open">
          Pane
        </GlassSurface>
      </GlassInteractionScope>,
    )
    const pane = screen.getByText('Pane')
    const mapCalls = vi.mocked(createModalGlassMaps).mock.calls.length
    fireEvent.pointerMove(pane, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    const warps = [...document.querySelectorAll('feDisplacementMap[in2="warp"]')]
    const scales = warps.map((warp) => Number(warp.getAttribute('scale')))
    expect(scales).toHaveLength(2)
    expect(scales[0]).toBeGreaterThan(0)
    expect(scales[0]).toBeLessThanOrEqual(6)
    expect(new Set(scales).size).toBe(1)
    for (const mask of ['core-mask', 'edge-mask', 'silhouette', 'rim-mask']) {
      expect(document.querySelector(`[result="${mask}"]`)?.getAttribute('in')).toBe('material-mask')
    }
    expect(document.querySelector('[result="shoulder-field"]')?.getAttribute('in2')).toBe(
      'shoulder-mask',
    )
    expect(document.querySelector('[result="fluid-field"]')).toBeNull()
    expect(createModalFluidAnimator).not.toHaveBeenCalled()
    expect(createModalGlassMaps).toHaveBeenCalledTimes(mapCalls)
    expect(pane.dataset.glassPresence).toBe('dialog')
    expect(vi.getTimerCount()).toBe(0)
    await act(async () => {
      pane.setAttribute('data-state', 'closed')
      await Promise.resolve()
    })
    expect(warps.every((warp) => warp.getAttribute('scale') === '0')).toBe(true)
    fireEvent.pointerMove(pane, { clientX: 2, clientY: 100 })
    expect(vi.getTimerCount()).toBe(0)
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not schedule work for center or distant input and settles after leaving', () => {
    vi.useFakeTimers()
    capabilities.fine = true
    vi.stubGlobal('PointerEvent', MouseEvent)
    render(
      <GlassInteractionScope>
        <GlassSurface role="dialog">Pane</GlassSurface>
      </GlassInteractionScope>,
    )
    const pane = screen.getByText('Pane')
    fireEvent.pointerMove(pane, { clientX: 150, clientY: 100 })
    expect(vi.getTimerCount()).toBe(0)
    fireEvent.pointerMove(pane, { clientX: -100, clientY: 100 })
    expect(vi.getTimerCount()).toBe(0)
    fireEvent.pointerMove(pane, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    fireEvent.pointerMove(document.body, { clientX: 500, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    expect(Number(pane.style.getPropertyValue('--glass-pointer-energy'))).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('gives unsupported optics the same subtle fallback response and press feedback', () => {
    vi.useFakeTimers()
    capabilities.native = false
    capabilities.fine = true
    vi.stubGlobal('PointerEvent', MouseEvent)
    render(
      <GlassInteractionScope>
        <GlassSurface role="control" interaction="control" motion="subtle">
          Control
        </GlassSurface>
      </GlassInteractionScope>,
    )
    const pane = screen.getByText('Control')
    fireEvent.pointerMove(pane, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    expect(pane.dataset.glassOptics).toBe('css')
    expect(pane.dataset.glassMotion).toBe('subtle')
    expect(Number(pane.style.getPropertyValue('--glass-pointer-energy'))).toBeCloseTo(0.25)
    fireEvent.pointerDown(pane, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    expect(Number(pane.style.getPropertyValue('--glass-press-energy'))).toBeCloseTo(0.25)
    fireEvent.pointerUp(pane, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    expect(Number(pane.style.getPropertyValue('--glass-press-energy'))).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('responds to a touch press on the native edge without treating touch travel as hover', () => {
    vi.useFakeTimers()
    render(
      <GlassInteractionScope>
        <GlassSurface role="dialog">Pane</GlassSurface>
      </GlassInteractionScope>,
    )
    const pane = screen.getByText('Pane')
    const touch = (type: string) => {
      const event = new MouseEvent(type, { bubbles: true, clientX: 2, clientY: 100 })
      Object.defineProperty(event, 'pointerType', { value: 'touch' })
      fireEvent(pane, event)
    }
    touch('pointermove')
    expect(vi.getTimerCount()).toBe(0)
    touch('pointerdown')
    act(() => vi.advanceTimersByTime(400))
    expect(Number(pane.style.getPropertyValue('--glass-press-energy'))).toBe(1)
    expect(
      [...document.querySelectorAll('feDisplacementMap[in2="warp"]')].every(
        (warp) => Number(warp.getAttribute('scale')) <= 6,
      ),
    ).toBe(true)
    touch('pointerup')
    act(() => vi.advanceTimersByTime(400))
    expect(Number(pane.style.getPropertyValue('--glass-press-energy'))).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('routes nested pane contact to one material and clears both on hidden reset', () => {
    vi.useFakeTimers()
    capabilities.native = false
    capabilities.fine = true
    vi.stubGlobal('PointerEvent', MouseEvent)
    render(
      <GlassInteractionScope>
        <GlassSurface data-testid="parent">
          <GlassSurface data-testid="child">Child</GlassSurface>
        </GlassSurface>
      </GlassInteractionScope>,
    )
    const parent = screen.getByTestId('parent')
    const child = screen.getByTestId('child')
    fireEvent.pointerMove(child, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(400))
    expect(Number(child.style.getPropertyValue('--glass-pointer-energy'))).toBe(1)
    expect(Number(parent.style.getPropertyValue('--glass-pointer-energy'))).toBe(0)
    fireEvent(document, new Event('visibilitychange'))
    expect(child.style.getPropertyValue('--glass-pointer-energy')).toBe('')
    expect(parent.style.getPropertyValue('--glass-pointer-energy')).toBe('')
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each(['off', 'keyboard', 'reduced', 'coarse'])(
    'keeps pointer deformation off for %s operation',
    (mode) => {
      vi.useFakeTimers()
      vi.stubGlobal('PointerEvent', MouseEvent)
      capabilities.fine = mode !== 'coarse'
      capabilities.reducedMotion = mode === 'reduced'
      if (mode === 'off') document.documentElement.dataset.glassMotion = mode
      if (mode === 'keyboard') document.documentElement.dataset.inputModality = 'keyboard'
      render(
        <GlassInteractionScope>
          <GlassSurface role="dialog">Pane</GlassSurface>
        </GlassInteractionScope>,
      )
      fireEvent.pointerMove(screen.getByText('Pane'), { clientX: 2, clientY: 100 })
      act(() => vi.advanceTimersByTime(400))
      expect(
        [...document.querySelectorAll('feDisplacementMap[in2="warp"]')].every(
          (warp) => warp.getAttribute('scale') === '0',
        ),
      ).toBe(true)
      expect(vi.getTimerCount()).toBe(0)
      expect(createModalFluidAnimator).not.toHaveBeenCalled()
    },
  )

  it('cancels an active bend when keyboard input takes priority', async () => {
    vi.useFakeTimers()
    capabilities.fine = true
    vi.stubGlobal('PointerEvent', MouseEvent)
    render(
      <GlassInteractionScope>
        <GlassSurface role="dialog">Pane</GlassSurface>
      </GlassInteractionScope>,
    )
    const pane = screen.getByText('Pane')
    fireEvent.pointerMove(pane, { clientX: 2, clientY: 100 })
    act(() => vi.advanceTimersByTime(100))
    expect(Number(pane.style.getPropertyValue('--glass-pointer-energy'))).toBeGreaterThan(0)
    await act(async () => {
      document.documentElement.dataset.inputModality = 'keyboard'
      await Promise.resolve()
    })
    expect(pane.dataset.glassMotion).toBe('off')
    expect(
      [...document.querySelectorAll('feDisplacementMap[in2="warp"]')].every(
        (warp) => warp.getAttribute('scale') === '0',
      ),
    ).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })
})
