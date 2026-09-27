import * as THREE from 'three'

type AuthSceneColors = {
  background: string
  pathColors?: Readonly<Record<string, string>>
}

function roundedRectangle(width: number, height: number, radius: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

export function createAuthScene() {
  const lensGeometry = new THREE.ExtrudeGeometry(roundedRectangle(1.12, 0.68, 0.13), {
    depth: 0.06,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.04,
    bevelSegments: 8,
    curveSegments: 24,
    steps: 1,
  })
  lensGeometry.translate(0, 0, -0.03)
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    transmission: 1,
    roughness: 0.075,
    ior: 1.46,
    thickness: 0.14,
    attenuationColor: 0xffffff,
    attenuationDistance: Infinity,
    clearcoat: 0.3,
    clearcoatRoughness: 0.09,
    dispersion: 0,
    envMapIntensity: 0.6,
  })
  const lens = new THREE.Mesh(lensGeometry, lensMaterial)
  lens.name = 'auth-clear-lens'
  lens.position.z = 0.18

  const backdrop = new THREE.Group()
  backdrop.name = 'auth-scene-bands'
  const profiles: Array<{ geometry: THREE.BufferGeometry; strengths: Array<number> }> = []
  for (const offset of [0, -0.22]) {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.7, -0.17 + offset, 0),
      new THREE.Vector3(-0.32, 0.58 + offset, 0),
      new THREE.Vector3(0.12, -0.35 + offset, 0),
      new THREE.Vector3(0.72, 0.16 + offset, 0),
    )
    const positions: Array<number> = []
    const indices: Array<number> = []
    const strengths: Array<number> = []
    const segments = 96
    const across = 12
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments
      const point = curve.getPoint(t)
      const tangent = curve.getTangent(t)
      const normal = new THREE.Vector2(-tangent.y, tangent.x).normalize()
      for (let j = 0; j <= across; j += 1) {
        const cross = (j / across) * 2 - 1
        const width = 0.085 * cross
        positions.push(point.x + normal.x * width, point.y + normal.y * width, 0)

        strengths.push(Math.pow(1 - Math.abs(cross), 2) * Math.pow(Math.sin(t * Math.PI), 0.7))
        if (i < segments && j < across) {
          const a = i * (across + 1) + j
          const b = a + across + 1
          indices.push(a, b, a + 1, b, b + 1, a + 1)
        }
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(positions.length, 3))
    geometry.setIndex(indices)
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.z = profiles.length * 0.001
    backdrop.add(mesh)
    profiles.push({ geometry, strengths })
  }

  return {
    lens,
    backdrop,
    setAppearance(material: 'glass' | 'matte', colors: AuthSceneColors) {
      lens.visible = material === 'glass'
      const background = new THREE.Color(colors.background)
      const ink = new THREE.Color()
      const color = new THREE.Color()
      profiles.forEach(({ geometry, strengths }, index) => {
        ink.set(colors.pathColors?.[index === 0 ? 'logo-base' : 'logo-blue'] ?? '#6985aa')
        const attribute = geometry.getAttribute('color')
        for (const [vertex, strength] of strengths.entries()) {
          color.copy(background).lerp(ink, strength * (material === 'glass' ? 0.12 : 0.055))
          attribute.setXYZ(vertex, color.r, color.g, color.b)
        }
        attribute.needsUpdate = true
      })
    },

    fit(viewWidth: number, viewHeight: number, cameraDistance: number) {
      const distance = 0.6
      const perspective = (cameraDistance + distance) / cameraDistance
      backdrop.position.z = -distance
      backdrop.scale.set(viewWidth * perspective, viewHeight * perspective, 1)
    },
    dispose() {
      lensGeometry.dispose()
      lensMaterial.dispose()
      for (const mesh of backdrop.children as Array<THREE.Mesh>) {
        mesh.geometry.dispose()
        const material = mesh.material as THREE.Material
        material.dispose()
      }
      backdrop.clear()
    },
  }
}
