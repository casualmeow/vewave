import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createModalFluidAnimator,
  createModalFluidField,
  neutralFluidMap,
} from '@/shared/lib/modal-glass-fluid'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('modal liquid field', () => {
  it('caps allocation, including very narrow and very large panes', () => {
    for (const [width, height] of [
      [900, 640],
      [7680, 4320],
      [5, 100_000],
      [100_000, 5],
    ]) {
      const field = createModalFluidField(width, height)
      expect(field.columns * field.rows).toBeLessThanOrEqual(8192)
      expect(Math.min(field.columns, field.rows)).toBeGreaterThanOrEqual(4)
    }
  })

  it('propagates an impulse beyond its initial footprint and settles to rest', () => {
    const field = createModalFluidField(700, 490)
    field.impulse(350, 245, 0.28)
    field.step()
    const initial = Float32Array.from(field.heights)
    let energy = 0
    for (let i = 0; i < 30; i++) energy = field.step()
    expect(field.heights.some((height, i) => initial[i] === 0 && Math.abs(height) > 0.0001)).toBe(
      true,
    )
    expect(energy).toBeGreaterThan(0.003)
    for (let i = 0; i < 300; i++) energy = field.step()
    expect(energy).toBeLessThan(0.003)
  })

  it('keeps repeated input finite, bounds the combined refraction vector, and resets exactly', () => {
    const field = createModalFluidField(700, 490)
    for (let i = 0; i < 120; i++) {
      field.impulse(350 + Math.sin(i) * 80, 245, 1)
      field.step()
    }
    expect(field.heights.every((height) => Number.isFinite(height) && Math.abs(height) <= 1)).toBe(
      true,
    )
    const pixels = new Uint8ClampedArray(field.columns * field.rows * 4)
    field.encode(pixels)
    for (let i = 0; i < pixels.length; i += 4) {
      expect(Math.hypot(pixels[i] - 128, pixels[i + 1] - 128)).toBeLessThanOrEqual(127)
      expect(pixels[i + 3]).toBe(255)
    }
    field.reset()
    expect(field.step()).toBe(0)
    field.encode(pixels)
    expect(Array.from(pixels.slice(0, 4))).toEqual([128, 128, 128, 255])
    expect(field.heights.every((height) => height === 0)).toBe(true)
  })
})

describe('modal liquid animation lifecycle', () => {
  function setup() {
    let id = 0
    let now = 0
    const frames = new Map<number, FrameRequestCallback>()
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++id, callback)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (key: number) => frames.delete(key))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
    const exportMap = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,field')
    const publish = vi.fn()
    const animator = createModalFluidAnimator(700, 490, publish)!
    const step = () => {
      now += 1000 / 120
      const pending = [...frames.values()]
      frames.clear()
      pending.forEach((callback) => callback(now))
    }
    return { animator, frames, step, exportMap, publish }
  }

  it('does no idle work, caps exports at 30fps, and stops after the wake settles', () => {
    const { animator, frames, step, exportMap, publish } = setup()
    expect(frames.size).toBe(0)
    animator.impulse(350, 245, 0.28)
    for (let i = 0; i < 120; i++) step()
    expect(exportMap.mock.calls.length).toBeGreaterThan(1)
    expect(exportMap.mock.calls.length).toBeLessThanOrEqual(31)
    for (let i = 0; i < 1200; i++) step()
    expect(frames.size).toBe(0)
    expect(publish).toHaveBeenLastCalledWith(neutralFluidMap, false)
    animator.dispose()
    animator.impulse(100, 100, 0.4)
    expect(frames.size).toBe(0)
  })

  it('clears the filter on reset and disables the loop when canvas export is blocked', () => {
    const { animator, frames, step, exportMap, publish } = setup()
    animator.impulse(350, 245, 0.28)
    step()
    animator.reset()
    expect(frames.size).toBe(0)
    expect(publish).toHaveBeenLastCalledWith(neutralFluidMap, false)
    exportMap.mockImplementation(() => {
      throw new Error('blocked')
    })
    animator.impulse(350, 245, 0.28)
    step()
    expect(frames.size).toBe(0)
    animator.impulse(350, 245, 0.28)
    expect(frames.size).toBe(0)
  })
})
