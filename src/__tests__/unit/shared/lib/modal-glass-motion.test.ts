import { describe, expect, it, vi } from 'vitest'
import type { ModalGlassFrame } from '@/shared/lib/modal-glass-motion'
import { createModalGlassMotion, modalGlassPointerTarget } from '@/shared/lib/modal-glass-motion'

const geometry = { width: 500, height: 400, radius: 24, intensity: 'balanced' as const }

function harness(opening = false) {
  let time = 0
  let id = 0
  const pending = new Map<number, FrameRequestCallback>()
  const render = vi.fn<(frame: ModalGlassFrame) => void>()
  const controller = createModalGlassMotion(render, opening, {
    now: () => time,
    request: (callback) => {
      pending.set(++id, callback)
      return id
    },
    cancel: (handle) => {
      pending.delete(handle)
    },
  })
  return {
    controller,
    render,
    pending,
    advance(frames: number) {
      for (let i = 0; i < frames; i++) {
        time += 16
        const callbacks = [...pending.values()]
        pending.clear()
        callbacks.forEach((callback) => callback(time))
      }
    },
    last: () => render.mock.calls.at(-1)![0],
  }
}

describe('modal perimeter motion', () => {
  it('projects approaches from inside or outside onto the same edge with a 96px reach', () => {
    expect(modalGlassPointerTarget(geometry, 250, 0)).toEqual({
      x: 250,
      y: 0,
      nx: 0,
      ny: -1,
      bend: 3,
    })
    expect(modalGlassPointerTarget(geometry, 250, 48).bend).toBe(1.5)
    expect(modalGlassPointerTarget(geometry, 250, -48).bend).toBe(1.5)
    expect(modalGlassPointerTarget(geometry, 250, 200).bend).toBe(0)
    expect(modalGlassPointerTarget(geometry, 250, -97).bend).toBe(0)
  })

  it('bounds the bend, settles, then releases without leaving an idle frame loop', () => {
    const motion = harness()
    expect(motion.pending.size).toBe(0)
    motion.controller.move(modalGlassPointerTarget(geometry, 250, 0))
    motion.advance(90)
    expect(motion.last().bend).toBe(3)
    expect(motion.pending.size).toBe(0)
    expect(motion.render.mock.calls.every(([frame]) => frame.bend >= 0 && frame.bend <= 3)).toBe(
      true,
    )
    motion.controller.release()
    motion.advance(90)
    expect(motion.last().bend).toBe(0)
    expect(motion.pending.size).toBe(0)
  })

  it('retargets from the current shape without exceeding the deformation bound', () => {
    const motion = harness()
    motion.controller.move(modalGlassPointerTarget(geometry, 250, 0))
    motion.advance(3)
    const previous = motion.last()
    motion.controller.move(modalGlassPointerTarget(geometry, 0, 200))
    expect(motion.last()).toBe(previous)
    motion.advance(90)
    expect(motion.last()).toMatchObject({ x: 0, y: 200, nx: -1, ny: 0, bend: 3 })
    expect(
      motion.render.mock.calls.every(
        ([frame]) => Math.hypot(frame.nx, frame.ny) * frame.bend <= 3.000001,
      ),
    ).toBe(true)
  })

  it('finishes its bounded optical opening in 240ms and cancels pending work on reset/dispose', () => {
    const motion = harness(true)
    motion.advance(15)
    expect(motion.last().refractionGain).toBe(1)
    expect(motion.pending.size).toBe(0)
    expect(motion.render.mock.calls.every(([frame]) => frame.refractionGain <= 1)).toBe(true)
    motion.controller.move(modalGlassPointerTarget(geometry, 250, 0))
    motion.controller.reset()
    expect(motion.pending.size).toBe(0)
    expect(motion.last().bend).toBe(0)
    motion.controller.dispose()
    const calls = motion.render.mock.calls.length
    motion.controller.move(modalGlassPointerTarget(geometry, 250, 0))
    motion.advance(20)
    expect(motion.render).toHaveBeenCalledTimes(calls)
    expect(motion.pending.size).toBe(0)
  })
})
