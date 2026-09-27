import { describe, expect, it, vi } from 'vitest'
import { createObjectFrameLoop, objectPixelRatio } from '@/components/canvas-ui/object-frame-loop'

function clock(render = vi.fn(() => false)) {
  let id = 0
  const pending = new Map<number, FrameRequestCallback>()
  const cancelFrame = vi.fn((frame: number) => {
    pending.delete(frame)
  })
  const loop = createObjectFrameLoop({
    render,
    requestFrame: (callback) => {
      pending.set(++id, callback)
      return id
    },
    cancelFrame,
  })
  return {
    loop,
    render,
    pending,
    cancelFrame,
    advance(time: number) {
      const callbacks = [...pending.values()]
      pending.clear()
      callbacks.forEach((callback) => callback(time))
    },
  }
}

describe('Canvas UI object frame budget', () => {
  it('coalesces invalidations and stops completely at rest', () => {
    const { loop, advance, pending, render } = clock()
    loop.invalidate()
    loop.invalidate()
    expect(pending.size).toBe(1)
    advance(0)
    expect(render).toHaveBeenCalledTimes(1)
    expect(pending.size).toBe(0)
    loop.invalidate()
    advance(100)
    expect(render).toHaveBeenCalledTimes(2)
    expect(pending.size).toBe(0)
  })

  it('caps active and repeatedly invalidated rendering at 30fps', () => {
    const { loop, advance, render } = clock(vi.fn(() => true))
    loop.invalidate()
    for (let time = 0; time < 1000; time += 8) {
      loop.invalidate()
      advance(time)
    }
    expect(render.mock.calls.length).toBeLessThanOrEqual(30)
    expect(render.mock.calls.length).toBeGreaterThan(20)
    loop.dispose()
  })

  it('suspends while hidden and cancels all pending work on disposal', () => {
    const { loop, advance, render, pending, cancelFrame } = clock()
    loop.invalidate()
    loop.setVisible(false)
    expect(cancelFrame).toHaveBeenCalledTimes(1)
    loop.invalidate()
    advance(0)
    expect(render).not.toHaveBeenCalled()
    loop.setVisible(true)
    advance(50)
    expect(render).toHaveBeenCalledTimes(1)
    loop.invalidate()
    loop.dispose()
    expect(pending.size).toBe(0)
    loop.invalidate()
    loop.setVisible(true)
    advance(100)
    expect(render).toHaveBeenCalledTimes(1)
  })

  it('limits retina and large drawing buffers without a minimum-DPR override', () => {
    expect(objectPixelRatio(400, 300, 3)).toBe(1.5)
    for (const [width, height] of [
      [800, 600],
      [4000, 3000],
    ]) {
      const ratio = objectPixelRatio(width, height, 3)
      expect(Math.floor(width * ratio) * Math.floor(height * ratio)).toBeLessThanOrEqual(600_000)
    }
  })
})
