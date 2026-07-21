import { BufferGeometry, Float32BufferAttribute, Vector3, type Camera, type Mesh } from 'three'

import type { FluidGlassShape } from '../types'
import type { FluidGlassStore } from './store'

export type VolumeDescriptor = {
  aspect: number
  depth: number
  key: string
  radius: number
  shape: FluidGlassShape
}

const normalizedDepth = 0.26
export const rearDepthRatio = 0.72
const edgeDepthRatio = 0.055
// Front weights sum to 1 so the convex profile reaches exactly zero at the rim
// with no clamped flat band. The heavy quadratic term keeps the broad body
// participating in refraction instead of leaving displacement to the last 10%.
const frontProfileWeights = [0.62, 0.28, 0.1] as const
const rearProfileWeights = [0.22, 0.34, 0.44] as const

function convexProfile(localThickness: number, rear: boolean) {
  const radialPosition = 1 - localThickness
  const [quadratic, quartic, eighth] = rear ? rearProfileWeights : frontProfileWeights
  const squared = radialPosition * radialPosition
  const fourth = squared * squared
  const eighthPower = fourth * fourth
  return clamp(1 - quadratic * squared - quartic * fourth - eighth * eighthPower, 0, 1)
}

function convexProfileDerivative(radialPosition: number) {
  const [quadratic, quartic, eighth] = frontProfileWeights
  const cubed = radialPosition * radialPosition * radialPosition
  const seventh = Math.pow(radialPosition, 7)
  return 2 * quadratic * radialPosition + 4 * quartic * cubed + 8 * eighth * seventh
}

type ScreenBounds = {
  x: number
  y: number
  width: number
  height: number
}

export function projectMeshBounds(
  mesh: Mesh,
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
): ScreenBounds {
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
  const bounds = mesh.geometry.boundingBox
  if (!bounds) return { x: 0, y: 0, width: 0, height: 0 }

  mesh.updateMatrixWorld(true)
  camera.updateMatrixWorld(true)

  let minimumX = Number.POSITIVE_INFINITY
  let minimumY = Number.POSITIVE_INFINITY
  let maximumX = Number.NEGATIVE_INFINITY
  let maximumY = Number.NEGATIVE_INFINITY
  const point = new Vector3()

  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        point.set(x, y, z).applyMatrix4(mesh.matrixWorld).project(camera)
        const screenX = (point.x * 0.5 + 0.5) * viewportWidth
        const screenY = (-point.y * 0.5 + 0.5) * viewportHeight
        minimumX = Math.min(minimumX, screenX)
        minimumY = Math.min(minimumY, screenY)
        maximumX = Math.max(maximumX, screenX)
        maximumY = Math.max(maximumY, screenY)
      }
    }
  }

  return {
    x: minimumX,
    y: minimumY,
    width: maximumX - minimumX,
    height: maximumY - minimumY,
  }
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return amount * amount * (3 - 2 * amount)
}

export function getVolumeDescriptor(store: FluidGlassStore): VolumeDescriptor {
  const lens = store.desired
  const height = Math.max(1, lens.height)
  const aspect = lens.shape === 'circle' ? 1 : clamp(lens.width / height, 0.65, 8)
  const radius =
    lens.shape === 'circle' || lens.shape === 'capsule'
      ? 0.5
      : clamp(lens.radius / height, 0.06, 0.46)
  const quantizedAspect = Math.round(aspect * 20) / 20
  const quantizedRadius = Math.round(radius * 40) / 40
  const depth = normalizedDepth

  return {
    aspect: quantizedAspect,
    depth,
    key: `${lens.shape}:${quantizedAspect}:${quantizedRadius}`,
    radius: quantizedRadius,
    shape: lens.shape,
  }
}

function roundedRectangleDistance(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  radius: number,
) {
  const qx = Math.abs(x) - halfWidth + radius
  const qy = Math.abs(y) - halfHeight + radius
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

function findRoundedRectangleBoundary(
  angle: number,
  halfWidth: number,
  halfHeight: number,
  radius: number,
) {
  const directionX = Math.cos(angle)
  const directionY = Math.sin(angle)
  let inside = 0
  let outside = Math.hypot(halfWidth, halfHeight) + radius

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const distance = (inside + outside) / 2
    const signedDistance = roundedRectangleDistance(
      directionX * distance,
      directionY * distance,
      halfWidth,
      halfHeight,
      radius,
    )
    if (signedDistance <= 0) inside = distance
    else outside = distance
  }

  return [directionX * inside, directionY * inside] as const
}

export function createVolumeGeometry(descriptor: VolumeDescriptor) {
  const geometry = new BufferGeometry()
  const positions: Array<number> = []
  const uvs: Array<number> = []
  const indices: Array<number> = []
  const halfWidth = descriptor.aspect / 2
  const halfHeight = 0.5
  const radius = Math.min(descriptor.radius, halfWidth, halfHeight)
  const radialSegments = 18
  const boundarySegments = descriptor.shape === 'circle' ? 80 : 96
  const edgeDepth = descriptor.depth * edgeDepthRatio
  const backDepth = descriptor.depth * rearDepthRatio
  const profileWidth = halfHeight
  const surfaceVertexCount = 1 + radialSegments * boundarySegments

  const addVertex = (x: number, y: number, z: number) => {
    positions.push(x, y, z)
    uvs.push(x / descriptor.aspect + 0.5, y + 0.5)
  }

  const addSurface = (front: boolean) => {
    addVertex(0, 0, front ? descriptor.depth : -backDepth)
    for (let ring = 1; ring <= radialSegments; ring += 1) {
      const radialPosition = ring / radialSegments
      for (let segment = 0; segment < boundarySegments; segment += 1) {
        const angle = (segment / boundarySegments) * Math.PI * 2
        const [boundaryX, boundaryY] = findRoundedRectangleBoundary(
          angle,
          halfWidth,
          halfHeight,
          radius,
        )
        const x = boundaryX * radialPosition
        const y = boundaryY * radialPosition
        const signedDistance = roundedRectangleDistance(x, y, halfWidth, halfHeight, radius)
        const localThickness = clamp(-signedDistance / profileWidth, 0, 1)
        const frontProfile = convexProfile(localThickness, false)
        const rearProfile = convexProfile(localThickness, true)
        const z = front
          ? edgeDepth + (descriptor.depth - edgeDepth) * frontProfile
          : -edgeDepth - (backDepth - edgeDepth) * rearProfile
        addVertex(x, y, z)
      }
    }
  }

  addSurface(true)
  addSurface(false)

  const surfaceIndex = (front: boolean, ring: number, segment: number) =>
    (front ? 0 : surfaceVertexCount) +
    (ring === 0 ? 0 : 1 + (ring - 1) * boundarySegments + (segment % boundarySegments))

  for (const front of [true, false]) {
    for (let segment = 0; segment < boundarySegments; segment += 1) {
      const next = (segment + 1) % boundarySegments
      const center = surfaceIndex(front, 0, segment)
      const first = surfaceIndex(front, 1, segment)
      const firstNext = surfaceIndex(front, 1, next)
      if (front) indices.push(center, first, firstNext)
      else indices.push(center, firstNext, first)
    }

    for (let ring = 1; ring < radialSegments; ring += 1) {
      for (let segment = 0; segment < boundarySegments; segment += 1) {
        const next = (segment + 1) % boundarySegments
        const inner = surfaceIndex(front, ring, segment)
        const innerNext = surfaceIndex(front, ring, next)
        const outer = surfaceIndex(front, ring + 1, segment)
        const outerNext = surfaceIndex(front, ring + 1, next)
        if (front) indices.push(inner, outer, outerNext, inner, outerNext, innerNext)
        else indices.push(inner, outerNext, outer, inner, innerNext, outerNext)
      }
    }
  }

  // Side walls get their own copies of the rim vertices so that
  // computeVertexNormals() does not blend wall normals into the surfaces.
  const sideFrontIndices: Array<number> = []
  const sideBackIndices: Array<number> = []
  for (let segment = 0; segment < boundarySegments; segment += 1) {
    const front = surfaceIndex(true, radialSegments, segment)
    const back = surfaceIndex(false, radialSegments, segment)
    const sideFrontIndex = positions.length / 3
    addVertex(positions[front * 3], positions[front * 3 + 1], positions[front * 3 + 2])
    sideFrontIndices.push(sideFrontIndex)
    const sideBackIndex = positions.length / 3
    addVertex(positions[back * 3], positions[back * 3 + 1], positions[back * 3 + 2])
    sideBackIndices.push(sideBackIndex)
  }
  for (let segment = 0; segment < boundarySegments; segment += 1) {
    const next = (segment + 1) % boundarySegments
    const front = sideFrontIndices[segment]
    const frontNext = sideFrontIndices[next]
    const back = sideBackIndices[segment]
    const backNext = sideBackIndices[next]
    indices.push(front, back, backNext, front, backNext, frontNext)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

export function measureFrontNormalHistogram(
  geometry: BufferGeometry,
  descriptor: VolumeDescriptor,
) {
  const normals = geometry.getAttribute('normal')
  const boundarySegments = descriptor.shape === 'circle' ? 80 : 96
  const frontVertexCount = 1 + 18 * boundarySegments
  const bins = [0, 0, 0, 0, 0]

  for (let index = 0; index < frontVertexCount; index += 1) {
    const z = clamp(normals.getZ(index), -1, 1)
    const angle = Math.acos(z) * (180 / Math.PI)
    if (angle < 2) bins[0] += 1
    else if (angle < 5) bins[1] += 1
    else if (angle < 10) bins[2] += 1
    else if (angle < 20) bins[3] += 1
    else bins[4] += 1
  }

  const total = Math.max(
    1,
    bins.reduce((sum, count) => sum + count, 0),
  )
  return {
    zeroToTwo: bins[0] / total,
    twoToFive: bins[1] / total,
    fiveToTen: bins[2] / total,
    tenToTwenty: bins[3] / total,
    twentyPlus: bins[4] / total,
  }
}

export function estimateTransmissionDisplacement(ior: number, thickness: number, height: number) {
  const eta = 1 / Math.max(1.001, ior)
  const edgeDepth = normalizedDepth * edgeDepthRatio
  const samples = [
    ['center', 0],
    ['25%', 0.25],
    ['50%', 0.5],
    ['75%', 0.75],
    ['90%', 0.9],
    ['edge', 0.985],
  ] as const

  return samples.map(([position, radiusFraction]) => {
    const profileDerivative = convexProfileDerivative(radiusFraction)
    const surfaceSlope = (normalizedDepth - edgeDepth) * profileDerivative * 2
    const normalLength = Math.hypot(surfaceSlope, 1)
    const normalX = surfaceSlope / normalLength
    const normalZ = 1 / normalLength
    const incidentDotNormal = -normalZ
    const discriminant = Math.max(0, 1 - eta * eta * (1 - incidentDotNormal * incidentDotNormal))
    const refractedX = Math.abs(-(eta * incidentDotNormal + Math.sqrt(discriminant)) * normalX)
    const displacement = refractedX * thickness * height
    return {
      position,
      horizontal: displacement,
      vertical: displacement,
      diagonal: displacement * Math.SQRT1_2,
    }
  })
}
