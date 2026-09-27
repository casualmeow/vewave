import type { GlassMotion } from '@/shared/theme/contract'
import { glassMotionProfiles } from '@/shared/theme/glass-motion'

export type GlassInteractionEvent = {
  phase: 'enter' | 'move' | 'press' | 'release' | 'exit' | 'reset'
  input: 'mouse' | 'pen' | 'touch' | 'keyboard'
  x: number
  y: number
  time: number
}

export type GlassInteractionGeometry = { width: number; height: number; radius: number }

export type GlassInteractionFrame = {
  x: number
  y: number
  nx: number
  ny: number
  energy: number
  pressure: number
  velocityX: number
  velocityY: number
  bend: number
  refractionGain: number
  progress?: number

  active: boolean
}

export const glassInteractionReach = 40
export const glassInteractionMaxBend = 3
export const glassInteractionSettleMs = glassMotionProfiles.fluid.settleMs

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smooth = (value: number) => value * value * (3 - 2 * value)

export function glassInteractionBoundary(geometry: GlassInteractionGeometry, x: number, y: number) {
  const { width, height } = geometry
  const radius = clamp(geometry.radius, 0, Math.min(width, height) / 2)
  const px = x - width / 2
  const py = y - height / 2
  const qx = Math.abs(px) - width / 2 + radius
  const qy = Math.abs(py) - height / 2 + radius
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  const length = Math.hypot(ox, oy)
  const nx = length > 0 ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0
  const ny = length > 0 ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py)
  return { distance: length + Math.min(Math.max(qx, qy), 0) - radius, nx, ny }
}

const neutral = () => ({
  x: 0,
  y: 0,
  nx: 0,
  ny: -1,
  energy: 0,
  pressure: 0,
  velocityX: 0,
  velocityY: 0,
})

export function createGlassInteractionController(initial: {
  motion: GlassMotion
  geometry: GlassInteractionGeometry
}) {
  let motion = initial.motion
  let geometry = initial.geometry
  let value = neutral()
  let target = neutral()
  let age: number = glassInteractionSettleMs
  let previous: { x: number; y: number; time: number } | null = null
  let active = false

  function reset() {
    value = neutral()
    target = neutral()
    previous = null
    age = glassInteractionSettleMs
    active = false
  }

  function release() {
    if (target.energy === 0 && target.pressure === 0) return

    if (target.pressure > 0 && value.pressure < target.pressure * 0.5) {
      value.energy = Math.max(value.energy, target.energy * 0.5)
      value.pressure = target.pressure * 0.5
    }
    target = { ...value, energy: 0, pressure: 0, velocityX: 0, velocityY: 0 }
    previous = null
    age = 0
    active = true
  }

  function input(event: GlassInteractionEvent) {
    if (event.phase === 'reset' || event.input === 'keyboard' || motion === 'off') {
      reset()
      return
    }
    if (event.phase === 'exit' || event.phase === 'release') {
      release()
      return
    }
    if (event.input === 'touch' && event.phase !== 'press') return
    if (![event.x, event.y, event.time].every(Number.isFinite)) return
    const boundary = glassInteractionBoundary(geometry, event.x, event.y)
    const proximity = 1 - smooth(clamp((Math.abs(boundary.distance) - 8) / 32, 0, 1))
    if (proximity === 0) {
      release()
      return
    }
    const x = event.x - boundary.nx * boundary.distance
    const y = event.y - boundary.ny * boundary.distance
    const gain = motion === 'fluid' ? 1 : 0.25
    const elapsed = previous ? Math.max(8, event.time - previous.time) : 16
    const dx = previous ? x - previous.x : 0
    const dy = previous ? y - previous.y : 0
    const pressure = event.phase === 'press' ? proximity * gain : 0
    if (
      previous &&
      Math.hypot(dx, dy) < 0.1 &&
      Math.abs(target.energy - proximity * gain) < 0.001 &&
      target.pressure === pressure
    )
      return
    if (value.energy === 0 && target.energy === 0) {
      value = { ...value, x, y, nx: boundary.nx, ny: boundary.ny }
    }
    target = {
      x,
      y,
      nx: boundary.nx,
      ny: boundary.ny,
      energy: proximity * gain,
      pressure,
      velocityX: 0,
      velocityY: 0,
    }
    value.velocityX = motion === 'fluid' ? clamp(dx / elapsed, -3, 3) : 0
    value.velocityY = motion === 'fluid' ? clamp(dy / elapsed, -3, 3) : 0
    previous = { x, y, time: event.time }
    age = 0
    active = true
  }

  function step(deltaMs: number): GlassInteractionFrame {
    if (motion === 'off') reset()
    if (active) {
      const delta = Number.isFinite(deltaMs) ? clamp(deltaMs, 0, 50) : 0
      age += delta
      const blend = 1 - Math.exp(-delta / (motion === 'fluid' ? 45 : 32))
      const keys = Object.keys(value) as Array<keyof typeof value>
      for (const key of keys) value[key] += (target[key] - value[key]) * blend
      if (
        age >= glassMotionProfiles[motion].settleMs ||
        keys.every((key) => Math.abs(target[key] - value[key]) < 0.0005)
      ) {
        value = { ...target }
        active = false
      }
    }
    const normalLength = Math.hypot(value.nx, value.ny) || 1
    return {
      ...value,
      nx: value.nx / normalLength,
      ny: value.ny / normalLength,
      bend: glassInteractionMaxBend * clamp(value.energy + value.pressure * 0.15, 0, 1),
      refractionGain: 1 + value.pressure * 0.04,
      progress: Math.min(1, age / Math.max(1, glassMotionProfiles[motion].settleMs)),
      active,
    }
  }

  return {
    input,
    step,
    reset,
    setMotion(next: GlassMotion) {
      if (next === motion) return
      motion = next
      reset()
    },
    setGeometry(next: GlassInteractionGeometry) {
      if (
        next.width !== geometry.width ||
        next.height !== geometry.height ||
        next.radius !== geometry.radius
      ) {
        geometry = next
        reset()
      }
    },
  }
}
