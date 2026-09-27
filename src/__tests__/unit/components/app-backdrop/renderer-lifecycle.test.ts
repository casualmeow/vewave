import { BufferGeometry, ShaderMaterial } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Three from 'three'
import { createBackdropRenderer } from '@/components/app-backdrop/renderer'
import { defaultAppearanceSettings } from '@/shared/theme/presets'

const gpu = vi.hoisted(() => ({
  render: vi.fn(),
  dispose: vi.fn(),
  loseContext: vi.fn(),
  setSize: vi.fn(),
  debug: { onShaderError: undefined as (() => void) | undefined },
}))
vi.mock('three', async (load) => ({
  ...(await load<typeof Three>()),
  WebGLRenderer: class {
    render = gpu.render
    dispose = gpu.dispose
    forceContextLoss = gpu.loseContext
    setSize = gpu.setSize
    debug = gpu.debug
  },
}))

const options = {
  settings: defaultAppearanceSettings.background,
  palette: { base: '#070A10', first: '#273B57', second: '#452744' },
  animated: true,
}
let pending: Map<number, FrameRequestCallback>
let visible: boolean
const disconnect = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  gpu.render.mockReset()
  visible = true
  let id = 0
  pending = new Map()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    pending.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (key: number) => pending.delete(key))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnect
    },
  )
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => !visible)
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 1920,
    height: 1080,
  } as DOMRect)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('background GPU lifecycle', () => {
  it.each([800_000, 100_000])('bounds the scene or preview canvas to %i pixels', (maxPixels) => {
    const engine = createBackdropRenderer(
      document.createElement('canvas'),
      { ...options, maxPixels },
      vi.fn(),
    )
    const [width, height] = gpu.setSize.mock.lastCall!
    expect(width * height).toBeLessThanOrEqual(maxPixels)
    expect(width / height).toBeCloseTo(1920 / 1080, 2)
    engine.dispose()
  })

  it('releases geometry, material, context, observers, and scheduled frames exactly once', () => {
    const geometry = vi.spyOn(BufferGeometry.prototype, 'dispose')
    const material = vi.spyOn(ShaderMaterial.prototype, 'dispose')
    const engine = createBackdropRenderer(document.createElement('canvas'), options, vi.fn())
    expect(pending.size).toBe(1)
    engine.dispose()
    engine.dispose()
    expect(pending.size).toBe(0)
    expect(geometry).toHaveBeenCalledTimes(1)
    expect(material).toHaveBeenCalledTimes(1)
    expect(gpu.dispose).toHaveBeenCalledTimes(1)
    expect(gpu.loseContext).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
    const count = gpu.render.mock.calls.length
    document.dispatchEvent(new Event('visibilitychange'))
    window.dispatchEvent(new Event('resize'))
    expect(gpu.render).toHaveBeenCalledTimes(count)
  })

  it('stops on visibility changes, draws only once for still updates, and cancels on context loss', () => {
    const canvas = document.createElement('canvas')
    const failed = vi.fn()
    const engine = createBackdropRenderer(canvas, options, failed)
    visible = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(pending.size).toBe(0)
    const count = gpu.render.mock.calls.length
    engine.update({ ...options, animated: false })
    expect(gpu.render).toHaveBeenCalledTimes(count)
    visible = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(pending.size).toBe(0)
    expect(gpu.render).toHaveBeenCalledTimes(count + 1)
    engine.update(options)
    expect(pending.size).toBe(1)
    canvas.dispatchEvent(new Event('webglcontextlost'))
    expect(failed).toHaveBeenCalledTimes(1)
    expect(gpu.dispose).toHaveBeenCalledTimes(1)
    expect(pending.size).toBe(0)
  })

  it('does not restart animation after a failure in the initial draw', () => {
    gpu.render.mockImplementationOnce(() => {
      throw new Error('Lost GPU')
    })
    const failed = vi.fn()
    const engine = createBackdropRenderer(document.createElement('canvas'), options, failed)
    expect(failed).toHaveBeenCalledTimes(1)
    expect(pending.size).toBe(0)
    expect(gpu.dispose).toHaveBeenCalledTimes(1)
    engine.dispose()
    expect(gpu.dispose).toHaveBeenCalledTimes(1)
  })
})
