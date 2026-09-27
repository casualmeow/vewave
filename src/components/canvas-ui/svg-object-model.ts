import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'

export type SvgObjectPart = {
  id: string
  sourceColor: THREE.Color
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
}

function flattenCapNormals(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const cb = new THREE.Vector3()
  const ab = new THREE.Vector3()
  for (const group of geometry.groups) {
    if (group.materialIndex !== 0) continue
    for (let i = group.start; i < group.start + group.count; i += 3) {
      a.fromBufferAttribute(position, i)
      b.fromBufferAttribute(position, i + 1)
      c.fromBufferAttribute(position, i + 2)
      cb.subVectors(c, b)
      ab.subVectors(a, b)
      cb.cross(ab).normalize()
      for (let j = 0; j < 3; j++) normal.setXYZ(i + j, cb.x, cb.y, cb.z)
    }
  }
  normal.needsUpdate = true
}

export function createSvgObjectModel(source: string) {
  const paths = new SVGLoader().parse(source).paths.flatMap((path, index) => {
    const data = path.userData as { node?: Element; style?: { fill?: string; opacity?: number } }
    if (data.style?.fill === 'none' || data.style?.opacity === 0) return []
    const shapes = path.toShapes()
    return shapes.length
      ? [{ id: data.node?.id || `path-${index}`, color: path.color, shapes }]
      : []
  })
  if (!paths.length) throw new Error('No fillable shapes in the SVG')

  const bounds = new THREE.Box2()
  for (const path of paths) {
    for (const shape of path.shapes) {
      for (const point of shape.getPoints(32)) bounds.expandByPoint(point)
    }
  }
  const center = bounds.getCenter(new THREE.Vector2())
  const size = Math.max(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, 1)
  const depth = size * 0.025
  const bevel = size * 0.002
  const group = new THREE.Group()
  const parts: Array<SvgObjectPart> = []

  for (const [index, path] of paths.entries()) {
    const extruded = new THREE.ExtrudeGeometry(path.shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 24,
    })
    const geometry = toCreasedNormals(extruded, Math.PI / 7)
    if (geometry !== extruded) extruded.dispose()
    flattenCapNormals(geometry)
    geometry.translate(-center.x, -center.y, -depth / 2)
    geometry.rotateX(Math.PI)
    geometry.scale(1 / size, 1 / size, 1 / size)

    const material = new THREE.MeshPhysicalMaterial({
      metalness: 0,
      ior: 1.35,
      dispersion: 0,
      specularIntensity: 0.45,
      thickness: 0.025,
      clearcoatRoughness: 0.2,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = path.id

    mesh.position.z = index * 0.0025
    group.add(mesh)
    parts.push({ id: path.id, sourceColor: path.color.clone(), mesh })
  }

  function setAppearance(material: 'glass' | 'matte', colors?: Readonly<Record<string, string>>) {
    for (const part of parts) {
      const surface = part.mesh.material
      const color = colors?.[part.id]
      if (color) surface.color.set(color)
      else surface.color.copy(part.sourceColor)

      surface.transmission = material === 'glass' ? 0.28 : 0
      surface.roughness = material === 'glass' ? 0.24 : 0.5
      surface.clearcoat = material === 'glass' ? 0.7 : 0.08
      surface.attenuationColor.copy(surface.color)
      surface.attenuationDistance = 1.5
      surface.needsUpdate = true
    }
  }
  setAppearance('matte')

  return {
    group,
    parts,
    setAppearance,
    dispose() {
      for (const part of parts) {
        part.mesh.geometry.dispose()
        part.mesh.material.dispose()
      }
      group.clear()
    },
  }
}
