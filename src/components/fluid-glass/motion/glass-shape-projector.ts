export type Vec2 = Readonly<{
  x: number
  y: number
}>

export type GlassStrain = Readonly<{
  extension: number
  shear: number
}>

export type MassBasisKind = 'linear-dipole' | 'softened-dipole' | 'localized-dipole'

export type CurvatureBasisKind = 'corner-window' | 'arc-profile'

export type GlassContourRegion =
  | 'top-edge'
  | 'top-right-corner'
  | 'right-edge'
  | 'bottom-right-corner'
  | 'bottom-edge'
  | 'bottom-left-corner'
  | 'left-edge'
  | 'top-left-corner'

export type GlassShapeProjectorInput = Readonly<{
  size: Vec2
  cornerRadius: number
  materialOffset: Vec2
  strain: GlassStrain
  massBias: Vec2
  curvatureBias: Vec2
  sampleCount: number

  massBasis: MassBasisKind

  curvatureBasis: CurvatureBasisKind
}>

export type ProjectedGlassSample = Readonly<{
  id: number
  s: number
  region: GlassContourRegion
  point: Vec2
  tangent: Vec2
  normal: Vec2

  curvature: number
  thickness: number
}>

export type GlassSupportPoints = Readonly<{
  left: Vec2
  topLeft: Vec2
  top: Vec2
  topRight: Vec2
  right: Vec2
  bottomRight: Vec2
  bottom: Vec2
  bottomLeft: Vec2
}>

export type ProjectedGlassShape = Readonly<{
  contour: ReadonlyArray<ProjectedGlassSample>
  supportPoints: GlassSupportPoints
  centroid: Vec2
  referenceArea: number
  projectedArea: number
  areaRatio: number
  deformationEnergy: number

  appliedNonlinearScale: number
  valid: boolean
}>

type BaseSample = {
  id: number
  s: number
  region: GlassContourRegion
  point: Vec2
  normal: Vec2
  localProgress: number
  cornerDirection: Vec2 | null
}

type Segment = {
  length: number
  region: GlassContourRegion
  cornerDirection: Vec2 | null
  sample: (progress: number) => Pick<BaseSample, 'point' | 'normal'>
}

type CandidateGeometry = {
  points: Array<Vec2>
  centroid: Vec2
  area: number
  valid: boolean
}

const epsilon = 1e-9
const minimumSampleCount = 8
const maximumNumericalStrain = 4
const maximumNumericalBias = 1
const topologySearchIterations = 12
const quarterTurn = Math.PI / 2
const diagonal = Math.SQRT1_2

const zero = { x: 0, y: 0 } as const

const emptySupportPoints: GlassSupportPoints = {
  left: zero,
  topLeft: zero,
  top: zero,
  topRight: zero,
  right: zero,
  bottomRight: zero,
  bottom: zero,
  bottomLeft: zero,
}

function emptyProjection(): ProjectedGlassShape {
  return {
    contour: [],
    supportPoints: emptySupportPoints,
    centroid: zero,
    referenceArea: 0,
    projectedArea: 0,
    areaRatio: 0,
    deformationEnergy: 0,
    appliedNonlinearScale: 0,
    valid: false,
  }
}

function add(left: Vec2, right: Vec2): Vec2 {
  return { x: left.x + right.x, y: left.y + right.y }
}

function subtract(left: Vec2, right: Vec2): Vec2 {
  return { x: left.x - right.x, y: left.y - right.y }
}

function multiply(vector: Vec2, scalar: number): Vec2 {
  return { x: vector.x * scalar, y: vector.y * scalar }
}

function dot(left: Vec2, right: Vec2) {
  return left.x * right.x + left.y * right.y
}

function cross(left: Vec2, right: Vec2) {
  return left.x * right.y - left.y * right.x
}

function length(vector: Vec2) {
  return Math.hypot(vector.x, vector.y)
}

function distance(left: Vec2, right: Vec2) {
  return Math.hypot(right.x - left.x, right.y - left.y)
}

function normalize(vector: Vec2): Vec2 {
  const magnitude = length(vector)
  return magnitude > epsilon ? multiply(vector, 1 / magnitude) : zero
}

function finiteVector(vector: Vec2) {
  return Number.isFinite(vector.x) && Number.isFinite(vector.y)
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function line(from: Vec2, to: Vec2, progress: number): Vec2 {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  }
}

function arc(
  center: Vec2,
  radius: number,
  startAngle: number,
  progress: number,
): Pick<BaseSample, 'point' | 'normal'> {
  const angle = startAngle - quarterTurn * progress
  const normal = { x: Math.cos(angle), y: Math.sin(angle) }
  return {
    point: add(center, multiply(normal, radius)),
    normal,
  }
}

function createSegments(width: number, height: number, radius: number): Array<Segment> {
  const halfWidth = width / 2
  const halfHeight = height / 2
  const horizontal = width - radius * 2
  const vertical = height - radius * 2
  const arcLength = quarterTurn * radius

  return [
    {
      length: horizontal,
      region: 'top-edge',
      cornerDirection: null,
      sample: (progress) => ({
        point: line(
          { x: -halfWidth + radius, y: halfHeight },
          { x: halfWidth - radius, y: halfHeight },
          progress,
        ),
        normal: { x: 0, y: 1 },
      }),
    },
    {
      length: arcLength,
      region: 'top-right-corner',
      cornerDirection: { x: diagonal, y: diagonal },
      sample: (progress) =>
        arc({ x: halfWidth - radius, y: halfHeight - radius }, radius, Math.PI / 2, progress),
    },
    {
      length: vertical,
      region: 'right-edge',
      cornerDirection: null,
      sample: (progress) => ({
        point: line(
          { x: halfWidth, y: halfHeight - radius },
          { x: halfWidth, y: -halfHeight + radius },
          progress,
        ),
        normal: { x: 1, y: 0 },
      }),
    },
    {
      length: arcLength,
      region: 'bottom-right-corner',
      cornerDirection: { x: diagonal, y: -diagonal },
      sample: (progress) =>
        arc({ x: halfWidth - radius, y: -halfHeight + radius }, radius, 0, progress),
    },
    {
      length: horizontal,
      region: 'bottom-edge',
      cornerDirection: null,
      sample: (progress) => ({
        point: line(
          { x: halfWidth - radius, y: -halfHeight },
          { x: -halfWidth + radius, y: -halfHeight },
          progress,
        ),
        normal: { x: 0, y: -1 },
      }),
    },
    {
      length: arcLength,
      region: 'bottom-left-corner',
      cornerDirection: { x: -diagonal, y: -diagonal },
      sample: (progress) =>
        arc({ x: -halfWidth + radius, y: -halfHeight + radius }, radius, -Math.PI / 2, progress),
    },
    {
      length: vertical,
      region: 'left-edge',
      cornerDirection: null,
      sample: (progress) => ({
        point: line(
          { x: -halfWidth, y: -halfHeight + radius },
          { x: -halfWidth, y: halfHeight - radius },
          progress,
        ),
        normal: { x: -1, y: 0 },
      }),
    },
    {
      length: arcLength,
      region: 'top-left-corner',
      cornerDirection: { x: -diagonal, y: diagonal },
      sample: (progress) =>
        arc({ x: -halfWidth + radius, y: halfHeight - radius }, radius, Math.PI, progress),
    },
  ]
}

function sampleBaseContour(
  width: number,
  height: number,
  radius: number,
  sampleCount: number,
): Array<BaseSample> {
  const segments = createSegments(width, height, radius).filter(
    (segment) => segment.length > epsilon,
  )
  const perimeter = segments.reduce((sum, segment) => sum + segment.length, 0)

  return Array.from({ length: sampleCount }, (_, id) => {
    const s = id / sampleCount
    let remaining = s * perimeter
    let selected = segments[segments.length - 1]

    for (const segment of segments) {
      selected = segment
      if (remaining < segment.length) break
      remaining -= segment.length
    }

    const localProgress = clamp(remaining / selected.length, 0, 1)
    const sampled = selected.sample(localProgress)
    return {
      id,
      s,
      region: selected.region,
      point: sampled.point,
      normal: sampled.normal,
      localProgress,
      cornerDirection: selected.cornerDirection,
    }
  })
}

function strainMatrix(strain: GlassStrain) {
  const magnitude = Math.hypot(strain.extension, strain.shear)
  if (magnitude < epsilon) return [1, 0, 0, 1] as const

  const identityScale = Math.cosh(magnitude)
  const strainScale = Math.sinh(magnitude) / magnitude
  return [
    identityScale + strainScale * strain.extension,
    strainScale * strain.shear,
    strainScale * strain.shear,
    identityScale - strainScale * strain.extension,
  ] as const
}

function applyMatrix(point: Vec2, matrix: readonly [number, number, number, number]): Vec2 {
  return {
    x: matrix[0] * point.x + matrix[1] * point.y,
    y: matrix[2] * point.x + matrix[3] * point.y,
  }
}

function massBasisValue(
  kind: MassBasisKind,
  sample: BaseSample,
  direction: Vec2,
  width: number,
  height: number,
  radius: number,
) {
  const z = dot(sample.normal, direction)
  if (kind === 'linear-dipole') return z
  if (kind === 'softened-dipole') return z * (1.5 - 0.5 * z * z)

  const tangentDirection = { x: -direction.y, y: direction.x }
  const tangentSupport =
    Math.abs(tangentDirection.x) * (width / 2 - radius) +
    Math.abs(tangentDirection.y) * (height / 2 - radius) +
    radius
  const tangentCoordinate = clamp(
    dot(sample.point, tangentDirection) / Math.max(epsilon, tangentSupport),
    -1,
    1,
  )
  const window = (1 - tangentCoordinate * tangentCoordinate) ** 2
  return z * window
}

function curvatureBasisValue(kind: CurvatureBasisKind, sample: BaseSample, direction: Vec2) {
  if (!sample.cornerDirection) return 0
  const window = Math.sin(Math.PI * sample.localProgress) ** 2
  const directionalProjection =
    kind === 'corner-window'
      ? dot(sample.cornerDirection, direction)
      : dot(sample.normal, direction)
  return -directionalProjection * window
}

function signedArea(points: ReadonlyArray<Vec2>) {
  let twiceArea = 0
  for (let index = 0; index < points.length; index += 1) {
    twiceArea += cross(points[index], points[(index + 1) % points.length])
  }
  return twiceArea / 2
}

function polygonCentroid(points: ReadonlyArray<Vec2>, area: number): Vec2 {
  let weightedX = 0
  let weightedY = 0

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    const weight = cross(current, next)
    weightedX += (current.x + next.x) * weight
    weightedY += (current.y + next.y) * weight
  }

  const divisor = 6 * area
  return { x: weightedX / divisor, y: weightedY / divisor }
}

function hasSafeClockwiseTopology(points: ReadonlyArray<Vec2>) {
  const scale = Math.max(
    1,
    ...points.map((point) => Math.max(Math.abs(point.x), Math.abs(point.y))),
  )
  const tolerance = scale * scale * 1e-10
  let hasClockwiseTurn = false

  for (let index = 0; index < points.length; index += 1) {
    const previous = points[(index - 1 + points.length) % points.length]
    const current = points[index]
    const next = points[(index + 1) % points.length]
    const turn = cross(subtract(current, previous), subtract(next, current))
    if (turn > tolerance) return false
    if (turn < -tolerance) hasClockwiseTurn = true
  }

  return hasClockwiseTurn
}

function correctAreaAndCentroid(
  points: Array<Vec2>,
  referencePolygonArea: number,
  materialOffset: Vec2,
): CandidateGeometry {
  const rawSignedArea = signedArea(points)
  const rawArea = Math.abs(rawSignedArea)
  if (!Number.isFinite(rawArea) || rawArea <= epsilon) {
    return { points: [], centroid: zero, area: 0, valid: false }
  }

  const rawCentroid = polygonCentroid(points, rawSignedArea)
  const areaScale = Math.sqrt(referencePolygonArea / rawArea)
  if (!finiteVector(rawCentroid) || !Number.isFinite(areaScale)) {
    return { points: [], centroid: zero, area: 0, valid: false }
  }

  const corrected = points.map((point) =>
    add(multiply(subtract(point, rawCentroid), areaScale), materialOffset),
  )
  const correctedSignedArea = signedArea(corrected)
  const correctedArea = Math.abs(correctedSignedArea)
  const centroid = polygonCentroid(corrected, correctedSignedArea)
  const valid =
    corrected.every(finiteVector) &&
    finiteVector(centroid) &&
    Number.isFinite(correctedArea) &&
    hasSafeClockwiseTopology(corrected)

  return { points: corrected, centroid, area: correctedArea, valid }
}

function deriveThickness(points: ReadonlyArray<Vec2>, rawThickness: ReadonlyArray<number>) {
  const weights = points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length]
    const next = points[(index + 1) % points.length]
    return (distance(previous, point) + distance(point, next)) / 2
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const weightedMean =
    rawThickness.reduce((sum, thickness, index) => sum + thickness * weights[index], 0) /
    Math.max(epsilon, totalWeight)

  return rawThickness.map((thickness) => thickness / Math.max(epsilon, weightedMean))
}

function deriveContour(
  base: ReadonlyArray<BaseSample>,
  points: ReadonlyArray<Vec2>,
  thickness: ReadonlyArray<number>,
): Array<ProjectedGlassSample> {
  return points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length]
    const next = points[(index + 1) % points.length]
    const incoming = normalize(subtract(point, previous))
    const outgoing = normalize(subtract(next, point))
    const tangent = normalize(subtract(next, previous))
    const normal = { x: -tangent.y, y: tangent.x }
    const turningAngle = Math.atan2(-cross(incoming, outgoing), dot(incoming, outgoing))
    const localArcLength = (distance(previous, point) + distance(point, next)) / 2

    return {
      id: base[index].id,
      s: base[index].s,
      region: base[index].region,
      point,
      tangent,
      normal,
      curvature: turningAngle / Math.max(epsilon, localArcLength),
      thickness: thickness[index],
    }
  })
}

function supportPoint(points: ReadonlyArray<Vec2>, direction: Vec2): Vec2 {
  let selected = points[0]
  let selectedProjection = dot(selected, direction)
  for (let index = 1; index < points.length; index += 1) {
    const projection = dot(points[index], direction)
    if (projection > selectedProjection) {
      selected = points[index]
      selectedProjection = projection
    }
  }
  return selected
}

function deriveSupportPoints(points: ReadonlyArray<Vec2>): GlassSupportPoints {
  return {
    left: supportPoint(points, { x: -1, y: 0 }),
    topLeft: supportPoint(points, { x: -diagonal, y: diagonal }),
    top: supportPoint(points, { x: 0, y: 1 }),
    topRight: supportPoint(points, { x: diagonal, y: diagonal }),
    right: supportPoint(points, { x: 1, y: 0 }),
    bottomRight: supportPoint(points, { x: diagonal, y: -diagonal }),
    bottom: supportPoint(points, { x: 0, y: -1 }),
    bottomLeft: supportPoint(points, { x: -diagonal, y: -diagonal }),
  }
}

function supportedBasis(input: GlassShapeProjectorInput) {
  return (
    ['linear-dipole', 'softened-dipole', 'localized-dipole'].includes(input.massBasis) &&
    ['corner-window', 'arc-profile'].includes(input.curvatureBasis)
  )
}

export function projectGlassShape(input: GlassShapeProjectorInput): ProjectedGlassShape {
  const sampleCount = Math.trunc(input.sampleCount)
  const finiteInput =
    finiteVector(input.size) &&
    finiteVector(input.materialOffset) &&
    finiteVector(input.massBias) &&
    finiteVector(input.curvatureBias) &&
    Number.isFinite(input.cornerRadius) &&
    Number.isFinite(input.strain.extension) &&
    Number.isFinite(input.strain.shear) &&
    Number.isFinite(input.sampleCount)
  const strainMagnitude = Math.hypot(input.strain.extension, input.strain.shear)
  const massMagnitude = length(input.massBias)
  const curvatureMagnitude = length(input.curvatureBias)

  if (
    !finiteInput ||
    !supportedBasis(input) ||
    input.size.x <= epsilon ||
    input.size.y <= epsilon ||
    sampleCount < minimumSampleCount ||
    strainMagnitude > maximumNumericalStrain ||
    massMagnitude > maximumNumericalBias ||
    curvatureMagnitude > maximumNumericalBias
  ) {
    return emptyProjection()
  }

  const width = input.size.x
  const height = input.size.y
  const radius = clamp(input.cornerRadius, 0, Math.min(width, height) / 2)
  const referenceArea = width * height - (4 - Math.PI) * radius * radius
  const scaleUnit = Math.min(width, height) / 2
  const matrix = strainMatrix(input.strain)
  const base = sampleBaseContour(width, height, radius, sampleCount)
  const referencePolygonArea = Math.abs(signedArea(base.map((sample) => sample.point)))
  const massDirection = massMagnitude > epsilon ? multiply(input.massBias, 1 / massMagnitude) : zero
  const curvatureDirection =
    curvatureMagnitude > epsilon ? multiply(input.curvatureBias, 1 / curvatureMagnitude) : zero
  const massValues = base.map((sample) =>
    massBasisValue(input.massBasis, sample, massDirection, width, height, radius),
  )
  const curvatureValues = base.map((sample) =>
    curvatureBasisValue(input.curvatureBasis, sample, curvatureDirection),
  )

  const buildCandidate = (nonlinearScale: number) => {
    const points = base.map((sample, index) => {
      const massDisplacement = scaleUnit * massMagnitude * massValues[index]
      const curvatureDisplacement = radius * curvatureMagnitude * curvatureValues[index]
      const displaced = add(
        sample.point,
        multiply(sample.normal, nonlinearScale * (massDisplacement + curvatureDisplacement)),
      )
      return applyMatrix(displaced, matrix)
    })
    return correctAreaAndCentroid(points, referencePolygonArea, input.materialOffset)
  }

  let appliedNonlinearScale = 1
  let candidate = buildCandidate(appliedNonlinearScale)
  if (!candidate.valid) {
    let lower = 0
    let upper = 1
    candidate = buildCandidate(lower)
    if (!candidate.valid) return emptyProjection()

    for (let iteration = 0; iteration < topologySearchIterations; iteration += 1) {
      const middle = (lower + upper) / 2
      const next = buildCandidate(middle)
      if (next.valid) {
        lower = middle
        candidate = next
      } else {
        upper = middle
      }
    }
    appliedNonlinearScale = lower
  }

  const rawThickness = massValues.map((value) =>
    Math.max(0.05, 1 + massMagnitude * appliedNonlinearScale * value),
  )
  const thickness = deriveThickness(candidate.points, rawThickness)
  const contour = deriveContour(base, candidate.points, thickness)
  const projectedArea = referenceArea * (candidate.area / referencePolygonArea)
  const deformationEnergy = Math.sqrt(
    (length(input.materialOffset) / Math.max(epsilon, scaleUnit)) ** 2 +
      2 * strainMagnitude * strainMagnitude +
      massMagnitude * massMagnitude +
      curvatureMagnitude * curvatureMagnitude,
  )

  return {
    contour,
    supportPoints: deriveSupportPoints(candidate.points),
    centroid: candidate.centroid,
    referenceArea,
    projectedArea,
    areaRatio: projectedArea / referenceArea,
    deformationEnergy,
    appliedNonlinearScale,
    valid: true,
  }
}
