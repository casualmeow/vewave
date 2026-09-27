import { describe, expect, it, vi } from 'vitest'

import type { RendererScheduler } from '@/components/fluid-glass/renderer/store/renderer-scheduler'
import type { FluidGlassLensSnapshot } from '@/components/fluid-glass/types'
import {
  LensMotionController,
  createEmptyLensSnapshot,
} from '@/components/fluid-glass/renderer/store/lens-motion-controller'

class FakeScheduler {
  animationScheduled = false
  notifyCount = 0
  private callback: ((timestamp: number) => void) | null = null

  notify() {
    this.notifyCount += 1
  }

  cancelAnimation() {
    this.animationScheduled = false
    this.callback = null
  }

  scheduleAnimation(callback: (timestamp: number) => void) {
    this.animationScheduled = true
    this.callback = callback
  }

  frame(timestamp: number) {
    const callback = this.callback
    this.callback = null
    this.animationScheduled = false
    callback?.(timestamp)
    return callback !== null
  }
}

function snapshotAt(x: number, y: number): FluidGlassLensSnapshot {
  return {
    ...createEmptyLensSnapshot(),
    x,
    y,
    width: 184,
    height: 36,
    radius: 6,
    opacity: 1,
  }
}

type Sample = {
  x: number
  y: number
  radius: number
  scaleX: number
  scaleY: number
  energy: number
  normalizedVelocity: number
}

function runRetarget(distance: number, { reducedMotion = false } = {}) {
  const scheduler = new FakeScheduler()
  const controller = new LensMotionController(
    scheduler as unknown as RendererScheduler,
    reducedMotion,
  )

  controller.retarget(1, 'settings-appearance', snapshotAt(0, 0), null)
  controller.retarget(2, 'settings-history', snapshotAt(0, distance), null)

  const samples: Array<Sample> = []
  const base = performance.now()
  for (let frame = 1; frame <= 120; frame += 1) {
    if (!scheduler.animationScheduled) break
    scheduler.frame(base + frame * 16)
    samples.push({
      x: controller.current.x,
      y: controller.current.y,
      radius: controller.current.radius,
      scaleX: controller.current.scaleX,
      scaleY: controller.current.scaleY,
      energy: controller.current.interactionEnergy,
      normalizedVelocity: controller.current.normalizedVelocity,
    })
  }

  return { controller, samples, scheduler }
}

describe('lens retarget motion', () => {
  it('snaps immediately and cancels a moving lens when motion is turned off', () => {
    const scheduler = new FakeScheduler()
    const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
    controller.retarget(1, 'a', snapshotAt(0, 0), null)
    controller.retarget(2, 'b', snapshotAt(0, 200), null)
    expect(scheduler.animationScheduled).toBe(true)
    controller.setMotionProfile('off')
    expect(controller.current.y).toBe(200)
    expect(controller.current.scaleX).toBe(1)
    expect(controller.current.scaleY).toBe(1)
    expect(scheduler.animationScheduled).toBe(false)
  })

  it('slides subtly for 180ms without deforming or leaving an idle frame loop', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)
    try {
      const scheduler = new FakeScheduler()
      const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
      controller.setMotionProfile('subtle')
      controller.retarget(1, 'a', snapshotAt(0, 0), null)
      controller.retarget(2, 'b', snapshotAt(0, 200), null)
      scheduler.frame(90)
      expect(controller.current.y).toBeGreaterThan(0)
      expect(controller.current.y).toBeLessThan(200)
      expect(controller.current.scaleX).toBe(1)
      expect(controller.current.scaleY).toBe(1)
      scheduler.frame(180)
      expect(controller.current.y).toBe(200)
      expect(scheduler.animationScheduled).toBe(false)
    } finally {
      now.mockRestore()
    }
  })

  it('caps fluid deformation and settles by 300ms', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)
    try {
      const scheduler = new FakeScheduler()
      const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
      controller.retarget(1, 'a', snapshotAt(0, 0), null)
      controller.retarget(2, 'b', snapshotAt(0, 600), null)
      for (let time = 16; time < 300; time += 16) {
        scheduler.frame(time)
        for (const scale of [controller.current.scaleX, controller.current.scaleY]) {
          expect(scale).toBeGreaterThanOrEqual(0.98)
          expect(scale).toBeLessThanOrEqual(1.05)
        }
      }
      scheduler.frame(300)
      expect(controller.current.y).toBe(600)
      expect(controller.current.scaleX).toBe(1)
      expect(controller.current.scaleY).toBe(1)
      expect(scheduler.animationScheduled).toBe(false)
    } finally {
      now.mockRestore()
    }
  })

  it.each([null, { dragEnergy: 0, dragged: false, pointerVelocityX: 0, pointerVelocityY: 0 }])(
    'places the first measured target immediately after an empty state (%j)',
    (interaction) => {
      const scheduler = new FakeScheduler()
      const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
      controller.retarget(1, null, createEmptyLensSnapshot(), null)
      controller.retarget(2, 'first', snapshotAt(44, 240), interaction)

      expect(controller.current).toMatchObject({ x: 44, y: 240, width: 184, height: 36 })
      expect(controller.current.scaleX).toBe(1)
      expect(controller.current.scaleY).toBe(1)
      expect(scheduler.animationScheduled).toBe(false)
    },
  )

  it('arrives within 225ms and retargets from the displayed position', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)
    try {
      const scheduler = new FakeScheduler()
      const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
      controller.retarget(1, 'a', snapshotAt(0, 0), null)
      controller.retarget(2, 'b', snapshotAt(0, 200), null)
      scheduler.frame(100)
      const position = controller.current.y
      now.mockReturnValue(100)
      controller.retarget(3, 'c', snapshotAt(0, 40), null)
      expect(controller.current.y).toBe(position)
      scheduler.frame(325)
      expect(controller.current.y).toBe(40)
    } finally {
      now.mockRestore()
    }
  })

  it('deforms during an ordinary selection change, not only during a drag', () => {
    const { samples } = runRetarget(160)

    const peakStretch = Math.max(...samples.map((sample) => sample.scaleY))

    expect(peakStretch).toBeGreaterThan(1.02)
    expect(peakStretch).toBeLessThanOrEqual(1.068)
  })

  it('narrows across the axis it stretches along', () => {
    const { samples } = runRetarget(160)
    const stretched = samples.reduce((best, sample) =>
      sample.scaleY > best.scaleY ? sample : best,
    )

    expect(stretched.scaleX).toBeLessThan(1)
  })

  it('compresses briefly on arrival and then settles to exact neutral', () => {
    const { controller, samples } = runRetarget(160)

    const peakIndex = samples.reduce(
      (best, sample, index) => (sample.scaleY > samples[best].scaleY ? index : best),
      0,
    )
    const afterPeak = samples.slice(peakIndex)

    expect(Math.min(...afterPeak.map((sample) => sample.scaleY))).toBeLessThan(1)

    expect(controller.current.scaleX).toBe(1)
    expect(controller.current.scaleY).toBe(1)
    expect(controller.current.normalizedVelocity).toBe(0)
  })

  it('raises material energy while travelling and returns it afterwards', () => {
    const { controller, samples } = runRetarget(160)

    expect(Math.max(...samples.map((sample) => sample.energy))).toBeGreaterThan(0.25)
    expect(Math.max(...samples.map((sample) => sample.normalizedVelocity))).toBeGreaterThan(0.1)
    expect(controller.current.interactionEnergy).toBeCloseTo(0.18, 5)
  })

  it('moves geometry and radius continuously, with no jump between frames', () => {
    const { samples } = runRetarget(160)

    expect(samples.length).toBeGreaterThan(8)

    const steps = samples.slice(1).map((sample, index) => Math.abs(sample.y - samples[index].y))
    expect(Math.max(...steps)).toBeLessThan(60)

    const middle = samples.slice(1, -1)
    expect(middle.every((sample) => sample.y > 0)).toBe(true)

    const radiusSteps = samples
      .slice(1)
      .map((sample, index) => Math.abs(sample.radius - samples[index].radius))
    expect(Math.max(...radiusSteps)).toBeLessThan(3)
  })

  it('scales deformation with distance travelled', () => {
    const near = runRetarget(44)
    const far = runRetarget(260)

    const peak = (samples: Array<Sample>) => Math.max(...samples.map((s) => s.scaleY))

    expect(peak(far.samples)).toBeGreaterThan(peak(near.samples))
  })

  it('moves without deforming under reduced motion', () => {
    const { controller, samples } = runRetarget(160, { reducedMotion: true })

    expect(samples.every((sample) => sample.scaleX === 1)).toBe(true)
    expect(samples.every((sample) => sample.scaleY === 1)).toBe(true)
    expect(samples.every((sample) => sample.normalizedVelocity === 0)).toBe(true)
    expect(controller.current.y).toBe(160)
  })

  it('keeps deformation neutral when reduced motion is turned on mid-flight', () => {
    const scheduler = new FakeScheduler()
    const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
    controller.retarget(1, 'a', snapshotAt(0, 0), null)
    controller.retarget(2, 'b', snapshotAt(0, 220), null)

    const base = performance.now()
    for (let frame = 1; frame <= 6; frame += 1) scheduler.frame(base + frame * 16)
    expect(controller.current.scaleY).not.toBe(1)

    controller.setReducedMotion(true)
    expect(controller.current.scaleX).toBe(1)
    expect(controller.current.scaleY).toBe(1)
  })

  it('ignores a superseded generation so two targets never animate at once', () => {
    const scheduler = new FakeScheduler()
    const controller = new LensMotionController(scheduler as unknown as RendererScheduler)
    controller.retarget(1, 'a', snapshotAt(0, 0), null)
    controller.retarget(5, 'b', snapshotAt(0, 200), null)

    expect(controller.retarget(3, 'c', snapshotAt(0, 999), null)).toBe(false)

    const base = performance.now()
    for (let frame = 1; frame <= 120; frame += 1) {
      if (!scheduler.animationScheduled) break
      scheduler.frame(base + frame * 16)
    }
    expect(controller.current.y).toBe(200)
  })
})
