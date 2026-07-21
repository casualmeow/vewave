import { describe, expect, it } from 'vitest'

import { sampleRoundedRectEdgeDisplacement } from '@/shared/lib/liquid-glass'

const surface = {
  width: 120,
  height: 48,
  radius: 12,
  edgeWidth: 10,
}

describe('liquid glass edge displacement geometry', () => {
  it('keeps the center stable', () => {
    expect(sampleRoundedRectEdgeDisplacement({ ...surface, x: 60, y: 24 })).toEqual({
      x: 0,
      y: 0,
      weight: 0,
    })
  })

  it('pushes samples along the outward normal near straight edges', () => {
    const left = sampleRoundedRectEdgeDisplacement({ ...surface, x: 0.5, y: 24 })
    const top = sampleRoundedRectEdgeDisplacement({ ...surface, x: 60, y: 0.5 })

    expect(left.weight).toBeGreaterThan(0.9)
    expect(left.x).toBeLessThan(-0.9)
    expect(Math.abs(left.y)).toBeLessThan(0.01)
    expect(top.weight).toBeGreaterThan(0.9)
    expect(top.y).toBeLessThan(-0.9)
    expect(Math.abs(top.x)).toBeLessThan(0.01)
  })

  it('uses a diagonal normal around rounded corners', () => {
    const corner = sampleRoundedRectEdgeDisplacement({ ...surface, x: 3.75, y: 3.75 })

    expect(corner.weight).toBeGreaterThan(0)
    expect(corner.x).toBeLessThan(0)
    expect(corner.y).toBeLessThan(0)
    expect(Math.abs(corner.x - corner.y)).toBeLessThan(0.1)
  })

  it('does not displace samples outside the surface', () => {
    expect(sampleRoundedRectEdgeDisplacement({ ...surface, x: -2, y: 24 })).toEqual({
      x: 0,
      y: 0,
      weight: 0,
    })
  })
})
