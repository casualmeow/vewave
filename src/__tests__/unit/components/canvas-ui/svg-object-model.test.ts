import { readFileSync } from 'node:fs'
import { Box3, Color, Mesh, Vector3 } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { createSvgObjectModel } from '@/components/canvas-ui/svg-object-model'
import { createAuthScene } from '@/components/canvas-ui/auth-scene'

const logo = readFileSync('public/vewave-mark.svg', 'utf8')

describe('Vewave SVG object', () => {
  it('preserves both original logo paths, colors and their shared alignment', () => {
    const model = createSvgObjectModel(logo)
    try {
      expect(model.parts.map((part) => part.id)).toEqual(['logo-base', 'logo-blue'])
      expect(model.parts.map((part) => part.mesh.material.color.getHexString())).toEqual([
        '667280',
        '6985aa',
      ])
      const [base, accent] = model.parts
      const baseBounds = new Box3().setFromObject(base.mesh)
      const accentBounds = new Box3().setFromObject(accent.mesh)

      expect(accentBounds.min.x).toBeGreaterThan(-0.02)
      expect(accentBounds.max.x).toBeCloseTo(baseBounds.max.x, 2)
      expect(accent.mesh.position.z).toBeGreaterThan(base.mesh.position.z)
      const size = new Box3().setFromObject(model.group).getSize(new Vector3())

      expect(size.x).toBeGreaterThanOrEqual(1)
      expect(size.x).toBeLessThan(1.01)
      expect(size.z).toBeLessThan(0.035)
    } finally {
      model.dispose()
    }
  })

  it('keeps colored faces in glass mode and changes both inks without rebuilding geometry', () => {
    const model = createSvgObjectModel(logo)
    try {
      const geometries = model.parts.map((part) => part.mesh.geometry)
      const colors = { 'logo-base': '#e5e5e5', 'logo-blue': '#8a8a8a' }
      model.setAppearance('glass', colors)
      expect(model.parts.map((part) => part.mesh.material.color.getHexString())).toEqual([
        'e5e5e5',
        '8a8a8a',
      ])
      for (const [index, part] of model.parts.entries()) {
        expect(part.mesh.geometry).toBe(geometries[index])
        expect(part.mesh.material.transmission).toBeGreaterThan(0)
        expect(part.mesh.material.transmission).toBeLessThan(0.5)
        expect(part.mesh.material.clearcoat).toBeGreaterThan(0)
      }
      model.setAppearance('matte')
      expect(model.parts.map((part) => part.mesh.material.color.getHexString())).toEqual([
        '667280',
        '6985aa',
      ])
      expect(model.parts.every((part) => part.mesh.material.transmission === 0)).toBe(true)
    } finally {
      model.dispose()
    }
  })

  it('releases each path’s geometry and material', () => {
    const model = createSvgObjectModel(logo)
    const releases = model.parts.flatMap((part) => [
      vi.spyOn(part.mesh.geometry, 'dispose'),
      vi.spyOn(part.mesh.material, 'dispose'),
    ])
    model.dispose()
    releases.forEach((release) => expect(release).toHaveBeenCalledTimes(1))
    expect(model.group.children).toHaveLength(0)
  })
})

describe('Auth glass composition', () => {
  it('puts a clear refracting volume in front of the opaque two-color mark', () => {
    const model = createSvgObjectModel(logo)
    const scene = createAuthScene()
    try {
      const pathColors = { 'logo-base': '#e5e5e5', 'logo-blue': '#8a8a8a' }
      model.setAppearance('matte', pathColors)
      scene.setAppearance('glass', { background: '#000000', pathColors })
      expect(model.parts.map((part) => part.mesh.material.color.getHexString())).toEqual([
        'e5e5e5',
        '8a8a8a',
      ])
      expect(model.parts.every((part) => part.mesh.material.transmission === 0)).toBe(true)
      expect(scene.lens.material.transmission).toBe(1)
      expect(scene.lens.material.ior).toBeGreaterThan(1)
      expect(scene.lens.material.thickness).toBeGreaterThan(0.1)
      expect(scene.lens.material.color.getHexString()).toBe('ffffff')
      const logoBounds = new Box3().setFromObject(model.group)
      const lensBounds = new Box3().setFromObject(scene.lens)
      expect(lensBounds.min.z).toBeGreaterThan(logoBounds.max.z)
      expect(lensBounds.min.x).toBeLessThan(logoBounds.min.x)
      expect(lensBounds.max.x).toBeGreaterThan(logoBounds.max.x)
      expect(lensBounds.getSize(new Vector3()).z).toBeCloseTo(0.14)
    } finally {
      model.dispose()
      scene.dispose()
    }
  })

  it('keeps the scene behind the lens opaque for the transmission pass and hides glass in solid mode', () => {
    const scene = createAuthScene()
    try {
      scene.setAppearance('glass', {
        background: '#000000',
        pathColors: { 'logo-base': '#e5e5e5', 'logo-blue': '#8a8a8a' },
      })
      const meshes = scene.backdrop.children.filter((child): child is Mesh => child instanceof Mesh)
      expect(meshes).toHaveLength(2)
      for (const mesh of meshes) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        expect(materials.every((material) => !material.transparent && material.opacity === 1)).toBe(
          true,
        )
        const colors = mesh.geometry.getAttribute('color')
        expect(Array.from(colors.array).every(Number.isFinite)).toBe(true)
        expect(Math.max(...colors.array)).toBeGreaterThan(0.02)
        expect(Math.max(...colors.array)).toBeLessThan(0.15)

        expect(new Color().fromBufferAttribute(colors, 0).getHexString()).toBe('000000')
      }
      const geometries = meshes.map((mesh) => mesh.geometry)
      scene.setAppearance('matte', { background: '#f0f0f0' })
      expect(scene.lens.visible).toBe(false)
      expect(meshes.map((mesh) => mesh.geometry)).toEqual(geometries)
      scene.fit(6, 4, 5)
      expect(scene.backdrop.position.z).toBeLessThan(0)
      expect(scene.backdrop.scale.x).toBeGreaterThan(6)
    } finally {
      scene.dispose()
    }
  })

  it('releases the lens and every backdrop geometry and material', () => {
    const scene = createAuthScene()
    const releases = [scene.lens, ...scene.backdrop.children].flatMap((child) => {
      const mesh = child as Mesh
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      return [
        vi.spyOn(mesh.geometry, 'dispose'),
        ...materials.map((material) => vi.spyOn(material, 'dispose')),
      ]
    })
    scene.dispose()
    releases.forEach((release) => expect(release).toHaveBeenCalledTimes(1))
    expect(scene.backdrop.children).toHaveLength(0)
  })
})
