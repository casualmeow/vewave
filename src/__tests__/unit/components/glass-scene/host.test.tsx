import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { Object3D } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'
import { GlassSceneHost } from '@/components/glass-scene'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'
import { useGlassScenePane } from '@/shared/lib/glass-scene-context'

const gpu = vi.hoisted(() => ({
  create: vi.fn(),
  instance: {
    setSize: vi.fn(),
    setPanes: vi.fn(),
    setSourceOptions: vi.fn(),
    setPointer: vi.fn(),
    setInteraction: vi.fn(),
    setPaused: vi.fn(),
    setMotion: vi.fn(),
    destroy: vi.fn(),
  },
}))
const routing = vi.hoisted(() => ({
  enabled: false,
  registry: {
    register:
      vi.fn<
        (element: HTMLElement, receive: (event: GlassInteractionEvent) => void) => () => void
      >(),
  },
}))
vi.mock('@/components/glass-scene/renderer', () => ({ createGlassSceneRenderer: gpu.create }))
vi.mock('@/shared/hooks/use-glass-appearance', () => ({ useGlassMotion: () => 'off' }))
vi.mock('@/shared/lib/glass-interaction-scope', () => ({
  useGlassInteractionScope: () => (routing.enabled ? routing.registry : null),
}))
const source = () => ({ object: new Object3D(), update() {}, dispose() {} })
const material = resolveGlassMaterial({ mode: 'light', intensity: 'balanced' })
function Pane() {
  const scene = useGlassScenePane({ enabled: true, material })
  return (
    <section ref={scene.ref} data-testid="pane" data-ready={String(scene.ready)}>
      <button>Native control</button>
    </section>
  )
}
let frames: Map<number, FrameRequestCallback>
beforeEach(() => {
  vi.clearAllMocks()
  routing.enabled = false
  routing.registry.register.mockReturnValue(() => {})
  gpu.create.mockReturnValue(gpu.instance)
  frames = new Map()
  let id = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (key: number) => frames.delete(key))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.tagName === 'CANVAS' ? new DOMRect(0, 0, 1200, 800) : new DOMRect(40, 40, 900, 700)
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('DOM glass scene host', () => {
  it('uses scoped target routing instead of a second global pointer listener', async () => {
    routing.enabled = true
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.tagName === 'CANVAS'
        ? new DOMRect(12, 24, 1200, 800)
        : new DOMRect(40, 40, 900, 700)
    })
    const listen = vi.spyOn(window, 'addEventListener')
    render(
      <GlassSceneHost source={source} sourceOptions={{}}>
        <Pane />
      </GlassSceneHost>,
    )
    await waitFor(() => expect(gpu.create).toHaveBeenCalledTimes(1))
    expect(routing.registry.register).toHaveBeenCalledTimes(1)
    expect(listen.mock.calls.some(([type]) => type === 'pointermove')).toBe(false)
    const [element, receive] = routing.registry.register.mock.calls[0]
    expect(element).toBe(screen.getByTestId('pane'))
    act(() => receive({ phase: 'press', input: 'touch', x: 45, y: 300, time: 0 }))
    expect(gpu.instance.setInteraction).toHaveBeenCalledWith(expect.any(String), {
      phase: 'press',
      input: 'touch',
      x: 33,
      y: 276,
      time: 0,
    })
    expect(gpu.instance.setPointer).not.toHaveBeenCalled()
  })
  it('keeps native children present without a source and marks panes ready only after successful paint', async () => {
    const onReadyChange = vi.fn()
    const { rerender, container } = render(
      <GlassSceneHost sourceOptions={{}} onReadyChange={onReadyChange}>
        <Pane />
      </GlassSceneHost>,
    )
    const button = screen.getByRole('button', { name: 'Native control' })
    expect(container.querySelector('canvas')).toBeNull()
    expect(gpu.create).not.toHaveBeenCalled()
    rerender(
      <GlassSceneHost source={source} sourceOptions={{}} onReadyChange={onReadyChange}>
        <Pane />
      </GlassSceneHost>,
    )
    await waitFor(() => expect(gpu.create).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('pane').getAttribute('data-ready')).toBe('false')
    expect(container.querySelector('canvas')?.style.visibility).toBe('hidden')
    expect(gpu.instance.setPanes).toHaveBeenCalledWith([
      expect.objectContaining({ x: 40, y: 40, width: 900, height: 700 }),
    ])
    const callbacks = gpu.create.mock.calls[0][1]
    act(() => callbacks.onFrame())
    expect(screen.getByTestId('pane').getAttribute('data-ready')).toBe('true')
    expect(container.querySelector('canvas')?.style.visibility).toBe('visible')
    expect(onReadyChange).toHaveBeenLastCalledWith(true)
    act(() => callbacks.onError())
    expect(screen.getByTestId('pane').getAttribute('data-ready')).toBe('false')
    expect(container.querySelector('canvas')?.style.visibility).toBe('hidden')
    expect(screen.getByRole('button', { name: 'Native control' })).toBe(button)
  })

  it('disposes and restores the DOM fallback when rendering is disabled', async () => {
    const { rerender, container } = render(
      <GlassSceneHost source={source} sourceOptions={{}}>
        <Pane />
      </GlassSceneHost>,
    )
    await waitFor(() => expect(gpu.create).toHaveBeenCalledTimes(1))
    act(() => gpu.create.mock.calls[0][1].onFrame())
    rerender(
      <GlassSceneHost source={source} sourceOptions={{}} enabled={false}>
        <Pane />
      </GlassSceneHost>,
    )
    expect(gpu.instance.destroy).toHaveBeenCalledTimes(1)
    expect(container.querySelector('canvas')).toBeNull()
    expect(screen.getByTestId('pane').getAttribute('data-ready')).toBe('false')
    expect(screen.getByRole('button')).toBeTruthy()
  })
})
