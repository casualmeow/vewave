import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Mesh, ShaderMaterial } from 'three'
import type { AuthSceneOptions } from '@/modules/auth/rendering/auth-scene-renderer'
import { createAuthDitherSource } from '@/modules/auth/rendering/auth-dither-source'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

const options: AuthSceneOptions = {
  palette: {
    background: '#000000',
    card: '#0a0a0a',
    popover: '#141414',
    foreground: '#e5e5e5',
    accent: '#8a8a8a',
  },
  surfaceStyle: 'glass',
  mode: 'dark',
  intensity: 'balanced',
  motion: 'fluid',
}
const plate = { x: 60, y: 92, width: 1200, height: 700, radius: 32 }
const sources: Array<ReturnType<typeof createAuthDitherSource>> = []

function create(next = options) {
  const invalidate = vi.fn()
  const source = createAuthDitherSource(next, { width: 1320, height: 840, invalidate })
  sources.push(source)
  const pane = {
    id: 'auth-plate',
    ...plate,
    enabled: next.surfaceStyle === 'glass',
    material: resolveGlassMaterial({ mode: next.mode, intensity: next.intensity }),
  }
  source.setPanes?.([pane])
  const object = source.object as Mesh
  const material = object.material as ShaderMaterial
  let time = 0
  function advance() {
    time += 40
    return source.frame?.(time) ?? false
  }
  function settle() {
    let moving = true
    for (let step = 0; step < 120 && moving; step += 1) moving = advance()
    expect(moving).toBe(false)
  }
  return { source, material, invalidate, advance, settle, pane, object }
}

afterEach(() => sources.splice(0).forEach((source) => source.dispose()))

describe('auth dither source', () => {
  it('shares the finite press response and resets immediately on cancellation', () => {
    const { source, material, advance, settle } = create()
    source.setInteraction?.({ phase: 'press', input: 'touch', x: 62, y: 400, time: 0 })
    advance()
    expect(material.uniforms.uPointerAmount.value).toBeGreaterThan(0)
    expect(material.uniforms.uEdgePulse.value).toBeGreaterThan(0)
    source.setInteraction?.({ phase: 'release', input: 'touch', x: 62, y: 400, time: 50 })
    settle()
    expect(material.uniforms.uPointerAmount.value).toBe(0)
    source.setInteraction?.({ phase: 'press', input: 'touch', x: 62, y: 400, time: 400 })
    advance()
    source.setInteraction?.({ phase: 'reset', input: 'keyboard', x: 0, y: 0, time: 500 })
    expect(material.uniforms.uPointerAmount.value).toBe(0)
    expect(material.uniforms.uEdgePulse.value).toBe(0)
    expect(advance()).toBe(false)
  })
  it('owns only background pixels, with no independent glass uniforms or renderer', () => {
    const { material, object } = create()
    expect(material.depthWrite).toBe(false)
    expect(object.frustumCulled).toBe(false)
    expect(material.uniforms).not.toHaveProperty('uDisplacement')
    expect(material.uniforms).not.toHaveProperty('uFormTint')
    expect(material.fragmentShader).not.toContain('convexRefraction')
  })

  it('does not invalidate for center, distant or non-finite pointer positions', () => {
    const { source, invalidate, advance } = create()
    expect(advance()).toBe(false)
    for (const [x, y] of [
      [660, 442],
      [0, 0],
      [1320, 400],
      [100, 400],
      [20, 400],
      [NaN, 400],
    ]) {
      source.setPointer?.(x, y, true)
    }
    expect(invalidate).not.toHaveBeenCalled()
  })

  it.each([
    { edge: 'left', x: 54, y: 400, originX: 60, originY: 400 },
    { edge: 'right', x: 1266, y: 400, originX: 1260, originY: 400 },
    { edge: 'top', x: 660, y: 86, originX: 660, originY: 92 },
    { edge: 'bottom', x: 660, y: 798, originX: 660, originY: 792 },
    {
      edge: 'corner',
      x: 60,
      y: 92,
      originX: 92 - 32 / Math.SQRT2,
      originY: 124 - 32 / Math.SQRT2,
    },
  ])(
    'projects the $edge wake onto the measured rounded perimeter',
    ({ x, y, originX, originY }) => {
      const { source, material, advance, settle, invalidate } = create()
      source.setPointer?.(x, y, true)
      expect(invalidate).toHaveBeenCalledTimes(1)
      expect(advance()).toBe(true)
      expect(material.uniforms.uEdgePulse.value).toBeGreaterThan(0)
      settle()
      expect(material.uniforms.uPointer.value.x).toBeCloseTo(originX, 4)
      expect(material.uniforms.uPointer.value.y).toBeCloseTo(originY, 4)
      expect(material.uniforms.uEdgePulse.value).toBe(0)
      expect(material.uniforms.uEdgePhase.value).toBe(1)
      expect(advance()).toBe(false)
    },
  )

  it.each(['fluid', 'subtle'] as const)(
    'ends the %s pulse and keeps a stationary edge still',
    (motion) => {
      const { source, material, advance, settle, invalidate } = create({ ...options, motion })
      source.setPointer?.(60, 400, true)
      advance()
      for (let step = 1; step < 11; step += 1) advance()
      expect(material.uniforms.uEdgePhase.value).toBe(1)
      settle()
      expect(material.uniforms.uPointerAmount.value).toBe(motion === 'fluid' ? 1 : 0.25)
      expect(material.uniforms.uEdgePulse.value).toBe(0)
      invalidate.mockClear()
      source.setPointer?.(60, 400, true)
      expect(invalidate).not.toHaveBeenCalled()
    },
  )

  it('preserves the source response on a disabled Solid optical pane', () => {
    const { source, material, settle } = create({ ...options, surfaceStyle: 'solid' })
    expect(material.uniforms.uSolid.value).toBe(1)
    source.setPointer?.(60, 400, true)
    settle()
    expect(material.uniforms.uPointerAmount.value).toBe(1)
    source.update(options)
    expect(material.uniforms.uSolid.value).toBe(0)
    expect(material.uniforms.uPointerAmount.value).toBe(1)
  })

  it.each(['center', 'leave'] as const)(
    'releases on %s without dragging the wake across content',
    (exit) => {
      const { source, material, advance, settle } = create()
      source.setPointer?.(60, 400, true)
      advance()
      const origin = material.uniforms.uPointer.value.toArray()
      if (exit === 'center') source.setPointer?.(660, 442, true)
      else source.setPointer?.(0, 0, false)
      settle()
      expect(material.uniforms.uPointer.value.toArray()).toEqual(origin)
      expect(material.uniforms.uPointerAmount.value).toBe(0)
      expect(material.uniforms.uEdgePulse.value).toBe(0)
    },
  )

  it('clears motion immediately and updates colors without replacing the source object', () => {
    const { source, material, advance, invalidate } = create()
    source.setPointer?.(60, 400, true)
    advance()
    source.update({
      ...options,
      motion: 'off',
      palette: { ...options.palette, background: '#ffffff' },
    })
    expect(material.uniforms.uBackground.value.getHexString()).toBe('ffffff')
    expect(material.uniforms.uPointerAmount.value).toBe(0)
    expect(material.uniforms.uEdgePulse.value).toBe(0)
    invalidate.mockClear()
    source.setPointer?.(60, 400, true)
    expect(invalidate).not.toHaveBeenCalled()
    expect(advance()).toBe(false)
  })

  it('resets stale disturbances after pane movement or canvas resize', () => {
    const { source, material, advance, pane } = create()
    source.setPointer?.(60, 400, true)
    advance()
    source.setPanes?.([{ ...pane, x: 100, height: 820 }])
    expect(material.uniforms.uPlate.value.toArray()).toEqual([100, 92, 1200, 820])
    expect(material.uniforms.uPointerAmount.value).toBe(0)
    source.setPointer?.(100, 400, true)
    advance()
    source.resize?.(1600, 1000)
    expect(material.uniforms.uSize.value.toArray()).toEqual([1600, 1000])
    expect(material.uniforms.uPointerAmount.value).toBe(0)
    expect(material.uniforms.uEdgePulse.value).toBe(0)
  })

  it('releases source resources once and ignores later interactions', () => {
    const { source, object, material, invalidate } = create()
    const geometryDispose = vi.spyOn(object.geometry, 'dispose')
    const materialDispose = vi.spyOn(material, 'dispose')
    source.dispose()
    source.dispose()
    source.setPointer?.(60, 400, true)
    expect(geometryDispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
    expect(invalidate).not.toHaveBeenCalled()
  })
})
