import { describe, expect, it, vi } from 'vitest'

import {
  createEdgeDisplacementMap,
  sampleRoundedRectEdgeDisplacement,
} from '@/shared/lib/liquid-glass'

const surface = {
  width: 120,
  height: 48,
  radius: 12,
  edgeWidth: 10,
}

describe('liquid glass edge displacement geometry', () => {
  it('keeps large-pane detail within a bounded texture and reuses unchanged geometry', () => {
    const sizes: Array<number> = []
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData(width: number, height: number) {
        sizes.push(width * height)
        return { data: new Uint8ClampedArray(width * height * 4) }
      },
      putImageData() {},
    } as unknown as CanvasRenderingContext2D)
    const encode = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,map')
    try {
      const wide = { width: 3440, height: 1440, radius: 24, edgeWidth: 22 }
      const first = createEdgeDisplacementMap(wide)
      expect(createEdgeDisplacementMap(wide)).toBe(first)
      expect(encode).toHaveBeenCalledTimes(1)
      expect(sizes[0]).toBeGreaterThan(90_000)
      expect(sizes[0]).toBeLessThanOrEqual(750_000)
    } finally {
      vi.restoreAllMocks()
    }
  })

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
