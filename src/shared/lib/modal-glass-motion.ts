import { modalGlassBoundary } from './modal-glass'
import type { ModalGlassGeometry } from './modal-glass'

export type ModalGlassBend = { x: number; y: number; nx: number; ny: number; bend: number }
export type ModalGlassFrame = ModalGlassBend & { refractionGain: number }

export const modalGlassPointerReach = 96
export const modalGlassMaxBend = 3

export function modalGlassPointerTarget(geometry: ModalGlassGeometry, x: number, y: number) {
  const { distance, nx, ny } = modalGlassBoundary(x, y, geometry)
  const proximity = Math.max(0, 1 - Math.abs(distance) / modalGlassPointerReach)
  return {
    x: x - nx * distance,
    y: y - ny * distance,
    nx,
    ny,
    bend: modalGlassMaxBend * proximity * proximity * (3 - 2 * proximity),
  }
}

type Clock = {
  now: () => number
  request: (callback: FrameRequestCallback) => number
  cancel: (id: number) => void
}

const keys = ['x', 'y', 'nx', 'ny', 'bend'] as const
const neutral: ModalGlassBend = { x: 0, y: 0, nx: 0, ny: -1, bend: 0 }

export function createModalGlassMotion(
  render: (frame: ModalGlassFrame) => void,
  opening = true,
  clock: Clock = {
    now: () => performance.now(),
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  },
) {
  let value = { ...neutral }
  let target = { ...neutral }
  const velocity = { x: 0, y: 0, nx: 0, ny: 0, bend: 0 }
  let frameId: number | null = null
  let previous = clock.now()
  let openingAt = opening ? previous : null
  let disposed = false

  const publish = (time: number) => {
    const progress = openingAt === null ? 1 : Math.min(1, (time - openingAt) / 240)
    if (progress === 1) openingAt = null
    const length = Math.max(1, Math.hypot(value.nx, value.ny))
    render({
      ...value,
      nx: value.nx / length,
      ny: value.ny / length,
      bend: Math.max(0, Math.min(modalGlassMaxBend, value.bend)),
      refractionGain: 1 - 0.08 * Math.pow(1 - progress, 3) * (1 + Math.sin(progress * Math.PI * 2)),
    })
  }
  const schedule = () => {
    if (frameId === null && !disposed) {
      previous = clock.now()
      frameId = clock.request(tick)
    }
  }
  const tick = (time: number) => {
    frameId = null

    let remaining = Math.min(0.04, Math.max(0, (time - previous) / 1000))
    while (remaining > 0) {
      const dt = Math.min(1 / 120, remaining)
      for (const key of keys) {
        velocity[key] += ((280 * (target[key] - value[key]) - 26 * velocity[key]) / 0.7) * dt
        value[key] += velocity[key] * dt
      }
      remaining -= dt
    }
    const settled = keys.every(
      (key) => Math.abs(target[key] - value[key]) < 0.01 && Math.abs(velocity[key]) < 0.02,
    )
    if (settled) {
      value = { ...target }
      keys.forEach((key) => (velocity[key] = 0))
    }
    publish(time)
    if (!settled || openingAt !== null) schedule()
  }
  const reset = () => {
    if (frameId !== null) clock.cancel(frameId)
    frameId = null
    openingAt = null
    value = { ...neutral }
    target = { ...neutral }
    keys.forEach((key) => (velocity[key] = 0))
    publish(clock.now())
  }
  publish(previous)
  if (opening) schedule()

  return {
    move(next: ModalGlassBend) {
      if (disposed) return

      if (value.bend === 0 && target.bend === 0) {
        value = { ...next, bend: 0 }
        keys.forEach((key) => (velocity[key] = 0))
      }
      target = { ...next, bend: Math.max(0, Math.min(modalGlassMaxBend, next.bend)) }
      schedule()
    },
    release() {
      if (disposed || target.bend === 0) return
      target = { ...value, bend: 0 }
      schedule()
    },
    reset,
    dispose() {
      reset()
      disposed = true
    },
  }
}
