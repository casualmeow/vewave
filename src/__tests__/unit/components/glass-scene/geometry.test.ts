import { PerspectiveCamera, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import {
  createScenePaneGeometry,
  sceneBufferSize,
  sceneCameraDistance,
  sceneCameraFov,
} from '@/components/glass-scene/geometry'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

describe('measured glass scene geometry', () => {
  it.each([
    [84, 900, 32],
    [250, 900, 24],
    [2800, 1300, 32],
    [1200, 720, 0],
  ])(
    'keeps the %s × %s pane silhouette and depth independent of aspect ratio',
    (width, height, radius) => {
      const material = resolveGlassMaterial({
        mode: 'light',
        intensity: 'balanced',
        thickness: 'regular',
      })
      const geometry = createScenePaneGeometry({
        id: 'pane',
        x: 0,
        y: 0,
        width,
        height,
        radius,
        material,
      })
      const size = geometry.boundingBox!.getSize(new Vector3())
      expect(size.x).toBeCloseTo(width, 3)
      expect(size.y).toBeCloseTo(height, 3)
      expect(size.z).toBeCloseTo(material.thickness, 3)
      expect(geometry.boundingBox!.max.z).toBeCloseTo(0)
      const position = geometry.getAttribute('position')
      for (let i = 0; i < position.count; i++) {
        const qx = Math.abs(position.getX(i)) - width / 2 + radius
        const qy = Math.abs(position.getY(i)) - height / 2 + radius
        const distance =
          Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius
        expect(distance).toBeLessThan(0.001)
      }
      expect([...geometry.getAttribute('normal').array].every(Number.isFinite)).toBe(true)
      geometry.dispose()
    },
  )

  it('fits CSS coordinates with perspective rays and caps ultrawide buffers at two megapixels', () => {
    for (const [width, height] of [
      [390, 844],
      [1440, 900],
      [3440, 1440],
      [7680, 2160],
    ]) {
      const size = sceneBufferSize(width, height, 3)
      expect(size.width * size.height).toBeLessThanOrEqual(2_000_000)
      expect(size.width / width).toBeLessThanOrEqual(1.5)
      const camera = new PerspectiveCamera(sceneCameraFov(height), width / height, 50_000, 150_000)
      camera.position.z = sceneCameraDistance
      camera.updateMatrixWorld()
      const corner = new Vector3(width / 2, height / 2, 0).project(camera)
      expect(corner.x).toBeCloseTo(1, 6)
      expect(corner.y).toBeCloseTo(1, 6)
    }
  })
})
