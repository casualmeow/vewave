import { DataUtils, HalfFloatType } from 'three'
import { describe, expect, it, vi } from 'vitest'
import {
  createSceneNormalPatch,
  normalPatchExtent,
  normalPatchResolution,
  scenePaneDistance,
} from '@/components/glass-scene/normal-patch'
import { createGlassInteractionController } from '@/shared/lib/glass-interaction'

const geometry = { width: 84, height: 900, radius: 32 }
function contact(x = 0, y = 300) {
  const controller = createGlassInteractionController({ geometry, motion: 'fluid' })
  controller.input({ phase: 'move', input: 'mouse', x, y, time: 0 })
  for (let i = 0; i < 6; i++) controller.step(50)
  return controller.step(0)
}

describe('local scene normal field', () => {
  it('changes actual optical normals while leaving silhouette, reading core and opposite edge neutral', () => {
    const patch = createSceneNormalPatch()
    const frame = contact()
    patch.update(geometry, frame)
    expect(patch.texture.type).toBe(HalfFloatType)
    const data = patch.texture.image.data as Uint16Array
    const half = DataUtils.toHalfFloat(0.5)
    const one = DataUtils.toHalfFloat(1)
    let changed = 0
    let leaked = 0
    for (let row = 0; row < normalPatchResolution; row++) {
      for (let column = 0; column < normalPatchResolution; column++) {
        const x =
          frame.x -
          normalPatchExtent / 2 +
          ((column + 0.5) * normalPatchExtent) / normalPatchResolution
        const y =
          frame.y +
          normalPatchExtent / 2 -
          ((row + 0.5) * normalPatchExtent) / normalPatchResolution
        const i = (row * normalPatchResolution + column) * 4
        const neutral = data[i] === half && data[i + 1] === half && data[i + 2] === one
        if (!neutral) changed++
        const depth = -scenePaneDistance(x, y, geometry)
        if (
          depth <= 0 ||
          depth >= 18 ||
          x > geometry.width / 2 ||
          row === 0 ||
          column === 0 ||
          row === 127 ||
          column === 127
        ) {
          if (!neutral) leaked++
        }
      }
    }
    expect(changed).toBeGreaterThan(0)
    expect(leaked).toBe(0)
    patch.dispose()
  })

  it('reuses its allocation, skips a held contact, and disposes its texture once', () => {
    const patch = createSceneNormalPatch()
    const frame = contact()
    const storage = patch.texture.image.data
    expect(patch.update(geometry, frame)).toBe(true)
    const version = patch.texture.version
    expect(patch.update(geometry, frame)).toBe(false)
    expect(patch.texture.version).toBe(version)
    expect(patch.update(geometry, { ...frame, y: 320, velocityY: 1.4 })).toBe(true)
    expect(patch.texture.image.data).toBe(storage)
    const dispose = vi.spyOn(patch.texture, 'dispose')
    patch.dispose()
    patch.dispose()
    expect(dispose).toHaveBeenCalledTimes(1)
    expect(patch.update(geometry, frame)).toBe(false)
  })

  it('can withdraw optics entirely when content reaches the boundary', () => {
    const patch = createSceneNormalPatch()
    patch.update(geometry, contact(), 4)
    const data = patch.texture.image.data as Uint16Array
    expect(
      [...data]
        .filter((_, index) => index % 4 < 2)
        .every((value) => value === DataUtils.toHalfFloat(0.5)),
    ).toBe(true)
    patch.dispose()
  })
})
