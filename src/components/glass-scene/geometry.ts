import { BoxGeometry, BufferGeometry, Float32BufferAttribute } from 'three'
import type { ScenePane } from './types'

export const sceneCameraDistance = 100_000

export function sceneBufferSize(width: number, height: number, dpr: number) {
  const scale = Math.min(Math.max(0.1, dpr || 1), 1.5, Math.sqrt(2_000_000 / (width * height)))
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  }
}

export function sceneCameraFov(height: number) {
  return (2 * Math.atan(height / (2 * sceneCameraDistance)) * 180) / Math.PI
}

export function createScenePaneGeometry(pane: ScenePane) {
  const { width, height } = pane
  const radius = Math.max(0, Math.min(pane.radius, width / 2, height / 2))
  const bevel = Math.min(pane.material.bevel, radius, width * 0.24, height * 0.24)
  const thickness = pane.material.thickness
  if (bevel === 0) {
    const geometry = new BoxGeometry(width, height, thickness)
    geometry.translate(0, 0, -thickness / 2)
    geometry.computeBoundingBox()
    return geometry
  }

  const arcSteps = 12
  const ringSteps = 16
  const ringSize = (arcSteps + 1) * 4
  const positions: Array<number> = []
  const normals: Array<number> = []
  const uvs: Array<number> = []
  const indices: Array<number> = []
  for (let ring = 0; ring <= ringSteps; ring++) {
    const theta = (ring / ringSteps) * Math.PI
    const inset = bevel * (1 - Math.sin(theta))
    const w = width - inset * 2
    const h = height - inset * 2
    const r = Math.max(0.001, radius - inset)
    const z = ((Math.cos(theta) - 1) * thickness) / 2
    const horizontalNormal = (thickness / 2) * Math.sin(theta)
    const verticalNormal = bevel * Math.cos(theta)
    const normalLength = Math.hypot(horizontalNormal, verticalNormal)
    const centers = [
      [w / 2 - r, -h / 2 + r],
      [w / 2 - r, h / 2 - r],
      [-w / 2 + r, h / 2 - r],
      [-w / 2 + r, -h / 2 + r],
    ]
    centers.forEach(([cx, cy], corner) => {
      for (let step = 0; step <= arcSteps; step++) {
        const angle = -Math.PI / 2 + ((corner + step / arcSteps) * Math.PI) / 2
        const nx = Math.cos(angle)
        const ny = Math.sin(angle)
        const x = cx + r * nx
        const y = cy + r * ny
        positions.push(x, y, z)
        normals.push(
          (nx * horizontalNormal) / normalLength,
          (ny * horizontalNormal) / normalLength,
          verticalNormal / normalLength,
        )
        uvs.push(x / width + 0.5, y / height + 0.5)
      }
    })
    if (ring === ringSteps) continue
    for (let point = 0; point < ringSize; point++) {
      const a = ring * ringSize + point
      const b = ring * ringSize + ((point + 1) % ringSize)
      indices.push(a, a + ringSize, b, b, a + ringSize, b + ringSize)
    }
  }
  const frontCenter = positions.length / 3
  positions.push(0, 0, 0, 0, 0, -thickness)
  normals.push(0, 0, 1, 0, 0, -1)
  uvs.push(0.5, 0.5, 0.5, 0.5)
  for (let point = 0; point < ringSize; point++) {
    const next = (point + 1) % ringSize
    indices.push(frontCenter, point, next)
    indices.push(frontCenter + 1, ringSteps * ringSize + next, ringSteps * ringSize + point)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeBoundingBox()
  return geometry
}
