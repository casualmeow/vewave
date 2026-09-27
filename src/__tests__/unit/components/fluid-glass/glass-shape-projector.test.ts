import { describe, expect, it } from 'vitest'

import {
  projectGlassShape,
  type CurvatureBasisKind,
  type GlassShapeProjectorInput,
  type MassBasisKind,
  type ProjectedGlassShape,
  type Vec2,
} from '@/components/fluid-glass/motion/glass-shape-projector'

const massBases: ReadonlyArray<MassBasisKind> = [
  'linear-dipole',
  'softened-dipole',
  'localized-dipole',
]
const curvatureBases: ReadonlyArray<CurvatureBasisKind> = ['corner-window', 'arc-profile']

function input(overrides: Partial<GlassShapeProjectorInput> = {}): GlassShapeProjectorInput {
  return {
    size: { x: 120, y: 40 },
    cornerRadius: 10,
    materialOffset: { x: 0, y: 0 },
    strain: { extension: 0, shear: 0 },
    massBias: { x: 0, y: 0 },
    curvatureBias: { x: 0, y: 0 },
    sampleCount: 64,
    massBasis: 'linear-dipole',
    curvatureBasis: 'corner-window',
    ...overrides,
  }
}

function expectVecClose(actual: Vec2, expected: Vec2, digits = 8) {
  expect(actual.x).toBeCloseTo(expected.x, digits)
  expect(actual.y).toBeCloseTo(expected.y, digits)
}

function clockwiseTopology(shape: ProjectedGlassShape) {
  return shape.contour.every((sample, index, contour) => {
    const previous = contour[(index - 1 + contour.length) % contour.length].point
    const next = contour[(index + 1) % contour.length].point
    const incoming = {
      x: sample.point.x - previous.x,
      y: sample.point.y - previous.y,
    }
    const outgoing = {
      x: next.x - sample.point.x,
      y: next.y - sample.point.y,
    }
    return incoming.x * outgoing.y - incoming.y * outgoing.x <= 1e-7
  })
}

function supportWidth(shape: ProjectedGlassShape) {
  return shape.supportPoints.right.x - shape.supportPoints.left.x
}

function regionAverageCurvature(shape: ProjectedGlassShape, region: string) {
  let weightedCurvature = 0
  let totalLength = 0
  for (let index = 0; index < shape.contour.length; index += 1) {
    const sample = shape.contour[index]
    if (sample.region !== region) continue
    const next = shape.contour[(index + 1) % shape.contour.length]
    const segmentLength = Math.hypot(next.point.x - sample.point.x, next.point.y - sample.point.y)
    weightedCurvature += sample.curvature * segmentLength
    totalLength += segmentLength
  }
  return weightedCurvature / totalLength
}

describe('static GlassShapeProjector', () => {
  it('has no implicit mass or curvature basis', () => {
    const incomplete = input() as unknown as Record<string, unknown>
    delete incomplete.massBasis
    delete incomplete.curvatureBasis

    const shape = projectGlassShape(incomplete as unknown as GlassShapeProjectorInput)

    expect(shape.valid).toBe(false)
    expect(shape.contour).toEqual([])
  })

  it('samples the neutral rounded rectangle analytically without moving its contour', () => {
    const shape = projectGlassShape(input())

    expect(shape.valid).toBe(true)
    expect(shape.contour).toHaveLength(64)
    expectVecClose(shape.contour[0].point, { x: -50, y: 20 })
    expect(shape.contour[0]).toMatchObject({ id: 0, s: 0, region: 'top-edge' })
    expectVecClose(shape.centroid, { x: 0, y: 0 })
    expect(shape.areaRatio).toBeCloseTo(1, 10)
    expect(shape.appliedNonlinearScale).toBe(1)
  })

  it('exposes named support points instead of positional array semantics', () => {
    const supportPoints = projectGlassShape(input()).supportPoints

    expect(Object.keys(supportPoints)).toEqual([
      'left',
      'topLeft',
      'top',
      'topRight',
      'right',
      'bottomRight',
      'bottom',
      'bottomLeft',
    ])
    expect(supportPoints.left.x).toBeCloseTo(-60, 8)
    expect(supportPoints.right.x).toBeCloseTo(60, 8)
    expect(supportPoints.top.y).toBeCloseTo(20, 8)
    expect(supportPoints.bottom.y).toBeCloseTo(-20, 8)
  })

  it('is deterministic for an identical input', () => {
    const state = input({
      materialOffset: { x: 2, y: -1 },
      strain: { extension: 0.04, shear: -0.02 },
      massBias: { x: 0.07, y: 0.03 },
      curvatureBias: { x: -0.08, y: 0.04 },
      massBasis: 'localized-dipole',
      curvatureBasis: 'arc-profile',
    })

    expect(projectGlassShape(state)).toEqual(projectGlassShape(state))
  })

  it('keeps sample identity as normalized perimeter order while regions may change', () => {
    const wide = projectGlassShape(input({ size: { x: 240, y: 40 }, sampleCount: 32 }))
    const square = projectGlassShape(input({ size: { x: 60, y: 60 }, sampleCount: 32 }))

    expect(wide.contour.map(({ id, s }) => ({ id, s }))).toEqual(
      square.contour.map(({ id, s }) => ({ id, s })),
    )
    expect(
      wide.contour.some((sample, index) => sample.region !== square.contour[index].region),
    ).toBe(true)
  })

  it('keeps traceless strain centered, symmetric, and area-preserving', () => {
    const shape = projectGlassShape(
      input({
        strain: { extension: 0.07, shear: 0.035 },
        sampleCount: 96,
      }),
    )

    expect(shape.valid).toBe(true)
    expect(shape.areaRatio).toBeCloseTo(1, 10)
    expectVecClose(shape.centroid, { x: 0, y: 0 })
    for (let index = 0; index < shape.contour.length / 2; index += 1) {
      const point = shape.contour[index].point
      const opposite = shape.contour[index + shape.contour.length / 2].point
      expectVecClose(opposite, { x: -point.x, y: -point.y }, 7)
    }
  })

  it('evaluates every candidate basis explicitly with finite, non-inverted output', () => {
    for (const massBasis of massBases) {
      for (const curvatureBasis of curvatureBases) {
        const shape = projectGlassShape(
          input({
            size: { x: 180, y: 44 },
            cornerRadius: 16,
            materialOffset: { x: 2.5, y: -1.25 },
            strain: { extension: 0.045, shear: 0.018 },
            massBias: { x: 0.08, y: -0.025 },
            curvatureBias: { x: 0.1, y: 0.04 },
            sampleCount: 96,
            massBasis,
            curvatureBasis,
          }),
        )

        expect(shape.valid, `${massBasis}/${curvatureBasis}`).toBe(true)
        expect(clockwiseTopology(shape), `${massBasis}/${curvatureBasis}`).toBe(true)
        expect(shape.areaRatio, `${massBasis}/${curvatureBasis}`).toBeCloseTo(1, 8)
        expectVecClose(shape.centroid, { x: 2.5, y: -1.25 }, 7)
        for (const sample of shape.contour) {
          expect(Number.isFinite(sample.point.x)).toBe(true)
          expect(Number.isFinite(sample.point.y)).toBe(true)
          expect(Number.isFinite(sample.tangent.x)).toBe(true)
          expect(Number.isFinite(sample.normal.y)).toBe(true)
          expect(Number.isFinite(sample.curvature)).toBe(true)
          expect(Number.isFinite(sample.thickness)).toBe(true)
          expect(sample.curvature).toBeGreaterThanOrEqual(-1e-9)
        }
      }
    }
  })

  it('measures deformation area against each current carrier base shape', () => {
    const first = projectGlassShape(
      input({
        size: { x: 120, y: 40 },
        cornerRadius: 10,
        massBias: { x: 0.08, y: 0 },
      }),
    )
    const resized = projectGlassShape(
      input({
        size: { x: 210, y: 62 },
        cornerRadius: 18,
        massBias: { x: 0.08, y: 0 },
      }),
    )

    expect(first.referenceArea).toBeCloseTo(120 * 40 - (4 - Math.PI) * 10 ** 2, 8)
    expect(resized.referenceArea).toBeCloseTo(210 * 62 - (4 - Math.PI) * 18 ** 2, 8)
    expect(first.areaRatio).toBeCloseTo(1, 8)
    expect(resized.areaRatio).toBeCloseTo(1, 8)
    expect(resized.referenceArea).toBeGreaterThan(first.referenceArea)
  })

  it('keeps candidate amplitude stable when sampling density changes', () => {
    const state = {
      size: { x: 180, y: 44 },
      cornerRadius: 16,
      massBias: { x: 0.08, y: 0.02 },
      curvatureBias: { x: 0.06, y: -0.03 },
      massBasis: 'localized-dipole' as const,
      curvatureBasis: 'arc-profile' as const,
    }
    const coarse = projectGlassShape(input({ ...state, sampleCount: 64 }))
    const dense = projectGlassShape(input({ ...state, sampleCount: 192 }))

    expect(coarse.valid).toBe(true)
    expect(dense.valid).toBe(true)
    expect(coarse.areaRatio).toBeCloseTo(dense.areaRatio, 8)
    expect(Math.abs(supportWidth(coarse) - supportWidth(dense))).toBeLessThan(0.35)
    expect(Math.abs(coarse.deformationEnergy - dense.deformationEnergy)).toBeLessThan(1e-12)
  })

  it('treats curvature as finite diagnostic data with aggregate convergence', () => {
    const state = {
      size: { x: 150, y: 54 },
      cornerRadius: 18,
      curvatureBias: { x: 0.1, y: 0.04 },
      curvatureBasis: 'corner-window' as const,
    }
    const coarse = projectGlassShape(input({ ...state, sampleCount: 96 }))
    const dense = projectGlassShape(input({ ...state, sampleCount: 192 }))
    const coarseAverage = regionAverageCurvature(coarse, 'top-right-corner')
    const denseAverage = regionAverageCurvature(dense, 'top-right-corner')

    expect(Number.isFinite(coarseAverage)).toBe(true)
    expect(Number.isFinite(denseAverage)).toBe(true)
    expect(coarseAverage).toBeGreaterThan(0)
    expect(denseAverage).toBeGreaterThan(0)
    expect(Math.abs(coarseAverage - denseAverage) / denseAverage).toBeLessThan(0.25)
  })

  it('handles sharp corners, capsule radii, and invalid degenerate inputs without NaN', () => {
    const sharp = projectGlassShape(input({ cornerRadius: 0 }))
    const capsule = projectGlassShape(
      input({ size: { x: 160, y: 40 }, cornerRadius: 999, sampleCount: 96 }),
    )
    const invalid = projectGlassShape(input({ size: { x: 0, y: 40 } }))

    expect(sharp.valid).toBe(true)
    expect(capsule.valid).toBe(true)
    expect(clockwiseTopology(sharp)).toBe(true)
    expect(clockwiseTopology(capsule)).toBe(true)
    expect(invalid).toMatchObject({ valid: false, contour: [], areaRatio: 0 })
    expect(JSON.stringify(invalid)).not.toContain('NaN')
  })
})
