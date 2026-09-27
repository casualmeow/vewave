import { describe, expect, it } from 'vitest'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'
import {
  createGlassInteractionController,
  glassInteractionBoundary,
} from '@/shared/lib/glass-interaction'

const geometry = { width: 600, height: 400, radius: 24 }
const edge: GlassInteractionEvent = { phase: 'move', input: 'mouse', x: 3, y: 200, time: 0 }

function create(motion: 'off' | 'subtle' | 'fluid' = 'fluid') {
  return createGlassInteractionController({ motion, geometry })
}

describe('shared glass interaction', () => {
  it('projects an edge contact while keeping the reading area idle', () => {
    const interaction = create()
    interaction.input({ ...edge, x: 300 })
    expect(interaction.step(30)).toMatchObject({ active: false, energy: 0, bend: 0 })
    interaction.input(edge)
    expect(interaction.step(30)).toMatchObject({ x: 0, y: 200, nx: -1, ny: 0, active: true })
    const corner = glassInteractionBoundary(geometry, 0, 0)
    expect(corner.distance).toBeGreaterThan(0)
    expect(Math.hypot(corner.nx, corner.ny)).toBeCloseTo(1)
  })

  it.each(['subtle', 'fluid'] as const)(
    'settles %s within 300ms and leaves held contact still',
    (motion) => {
      const interaction = create(motion)
      interaction.input(edge)
      for (let i = 0; i < 10; i++) interaction.step(30)
      expect(interaction.step(0)).toMatchObject({
        active: false,
        energy: motion === 'fluid' ? 1 : 0.25,
      })
      interaction.input({ ...edge, time: 400 })
      expect(interaction.step(0).active).toBe(false)
      interaction.input({ ...edge, phase: 'exit', time: 500 })
      for (let i = 0; i < 10; i++) interaction.step(30)
      expect(interaction.step(0)).toMatchObject({ active: false, energy: 0, bend: 0, pressure: 0 })
    },
  )

  it('retargets a moving edge from its current contact without exceeding the bend bound', () => {
    const interaction = create()
    interaction.input(edge)
    const previous = interaction.step(30)
    interaction.input({ ...edge, x: 300, y: 1, time: 40 })
    expect(interaction.step(0).x).toBe(previous.x)
    const next = interaction.step(30)
    expect(next.x).toBeGreaterThan(0)
    expect(next.x).toBeLessThan(300)
    expect(next.bend).toBeLessThanOrEqual(3)
    expect(next.velocityX).toBeLessThanOrEqual(3)
  })

  it('uses touch for press and release only, never hover or a dragged wake', () => {
    const interaction = create()
    interaction.input({ ...edge, input: 'touch' })
    expect(interaction.step(30).energy).toBe(0)
    interaction.input({ ...edge, input: 'touch', phase: 'press' })
    expect(interaction.step(30).pressure).toBeGreaterThan(0)
    interaction.input({ ...edge, input: 'touch', phase: 'release', time: 50 })
    for (let i = 0; i < 10; i++) interaction.step(30)
    expect(interaction.step(0)).toMatchObject({ pressure: 0, energy: 0, active: false })
  })

  it('preserves a quick tap that begins and ends between optical paints', () => {
    const interaction = create()
    interaction.input({ ...edge, input: 'touch', phase: 'press' })
    interaction.input({ ...edge, input: 'touch', phase: 'release', time: 12 })
    const firstPaint = interaction.step(33)
    expect(firstPaint.energy).toBeGreaterThan(0)
    expect(firstPaint.pressure).toBeGreaterThan(0)
    for (let i = 0; i < 10; i++) interaction.step(30)
    expect(interaction.step(0)).toMatchObject({ energy: 0, pressure: 0, active: false })
  })

  it('resets immediately for keyboard, Off, cancellation and changed geometry', () => {
    const interaction = create()
    for (const reset of [
      () => interaction.input({ ...edge, input: 'keyboard' }),
      () => interaction.input({ ...edge, phase: 'reset' }),
      () => interaction.setMotion('off'),
      () => interaction.setGeometry({ ...geometry, width: 500 }),
    ]) {
      interaction.setMotion('fluid')
      interaction.input(edge)
      expect(interaction.step(30).energy).toBeGreaterThan(0)
      reset()
      expect(interaction.step(0)).toMatchObject({ energy: 0, active: false, pressure: 0 })
    }
  })

  it('ignores invalid input and bounds long suspended frame intervals', () => {
    const interaction = create()
    interaction.input({ ...edge, x: NaN })
    expect(interaction.step(30).active).toBe(false)
    interaction.input(edge)
    const frame = interaction.step(10_000)
    expect(frame.energy).toBeGreaterThan(0)
    expect(frame.energy).toBeLessThanOrEqual(1)
    expect(Number.isFinite(frame.bend)).toBe(true)
  })
})
