import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AuthSceneGeometry,
  AuthSceneOptions,
} from '@/modules/auth/rendering/auth-scene-renderer'
import { createAuthSceneRenderer } from '@/modules/auth/rendering/auth-scene-renderer'
import { createAuthDitherSource } from '@/modules/auth/rendering/auth-dither-source'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

const scene = vi.hoisted(() => ({
  create: vi.fn(),
  setSourceOptions: vi.fn(),
  setSize: vi.fn(),
  setPanes: vi.fn(),
  setPointer: vi.fn(),
  setInteraction: vi.fn(),
  setPaused: vi.fn(),
  setMotion: vi.fn(),
  destroy: vi.fn(),
}))
vi.mock('@/components/glass-scene/renderer', () => ({ createGlassSceneRenderer: scene.create }))

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
const geometry: AuthSceneGeometry = {
  width: 1320,
  height: 840,
  plate: { x: 60, y: 92, width: 1200, height: 700, radius: 32 },
  formStartX: 850,
}

beforeEach(() => {
  vi.clearAllMocks()
  scene.create.mockReturnValue(scene)
})

function create(next = options) {
  const canvas = document.createElement('canvas')
  const instance = createAuthSceneRenderer(canvas, next)
  if (!instance) throw new Error('Expected auth adapter')
  return { canvas, instance }
}

describe('auth shared-scene adapter', () => {
  it('passes scoped presses and cancellation to the same optical pane', () => {
    const { instance } = create()
    const press = { phase: 'press' as const, input: 'touch' as const, x: 62, y: 400, time: 10 }
    instance.setInteraction(press)
    expect(scene.setInteraction).not.toHaveBeenCalled()
    instance.setGeometry(geometry)
    instance.setInteraction(press)
    expect(scene.setInteraction).toHaveBeenLastCalledWith('auth-plate', press)
    instance.setInteraction({ ...press, phase: 'reset' })
    expect(scene.setInteraction).toHaveBeenLastCalledWith('auth-plate', {
      ...press,
      phase: 'reset',
    })
    instance.destroy()
    scene.setInteraction.mockClear()
    instance.setInteraction(press)
    expect(scene.setInteraction).not.toHaveBeenCalled()
  })
  it('delegates one source and readiness/failure callbacks to the shared renderer', () => {
    const onReady = vi.fn()
    const onError = vi.fn()
    const initial = { ...options, onReady, onError }
    const { canvas } = create(initial)
    expect(scene.create).toHaveBeenCalledExactlyOnceWith(canvas, {
      source: createAuthDitherSource,
      sourceOptions: initial,
      motion: 'fluid',
      onReady,
      onError,
    })
    expect(onReady).not.toHaveBeenCalled()
    expect(scene.setPanes).not.toHaveBeenCalled()
  })

  it('registers the measured pane with the common optical material', () => {
    const { instance } = create()
    instance.setGeometry(geometry)
    expect(scene.setSize).toHaveBeenCalledWith(1320, 840)
    expect(scene.setPanes).toHaveBeenLastCalledWith([
      {
        id: 'auth-plate',
        ...geometry.plate,
        enabled: true,
        material: resolveGlassMaterial({
          mode: 'dark',
          intensity: 'balanced',
          role: 'form',
          thickness: 'thick',
          tokens: {
            background: options.palette.background,
            card: options.palette.card,
            popover: options.palette.popover,
            foreground: options.palette.foreground,
          },
        }),
      },
    ])
    expect(scene.setPaused).toHaveBeenLastCalledWith(false)
  })

  it('retains geometry for Solid texture interaction while disabling its transmission mesh', () => {
    const { instance } = create()
    instance.setGeometry(geometry)
    const solid = { ...options, surfaceStyle: 'solid' as const, motion: 'subtle' as const }
    instance.setOptions(solid)
    expect(scene.setSourceOptions).toHaveBeenLastCalledWith(solid)
    expect(scene.setPanes).toHaveBeenLastCalledWith([
      expect.objectContaining({ ...geometry.plate, enabled: false }),
    ])
    instance.setPointer(60, 400)
    expect(scene.setPointer).toHaveBeenLastCalledWith(60, 400, true)
    instance.setPointer(0, 0, false)
    expect(scene.setPointer).toHaveBeenLastCalledWith(0, 0, false)
    expect(scene.create).toHaveBeenCalledTimes(1)
  })

  it('pauses invalid geometry and prevents interaction until measurement recovers', () => {
    const { instance } = create()
    instance.setPointer(60, 400)
    expect(scene.setPointer).not.toHaveBeenCalled()
    instance.setGeometry(geometry)
    instance.setGeometry({ ...geometry, width: 0 })
    expect(scene.setPanes).toHaveBeenLastCalledWith([])
    expect(scene.setPaused).toHaveBeenLastCalledWith(true)
    instance.setPointer(60, 400)
    expect(scene.setPointer).not.toHaveBeenCalled()
    instance.setGeometry({ ...geometry, plate: { ...geometry.plate, height: 820 } })
    expect(scene.setPanes).toHaveBeenLastCalledWith([expect.objectContaining({ height: 820 })])
    expect(scene.setPaused).toHaveBeenLastCalledWith(false)
  })

  it('clamps rounded geometry consistently with the DOM dimensions', () => {
    const { instance } = create()
    instance.setGeometry({ ...geometry, plate: { ...geometry.plate, radius: 10000 } })
    expect(scene.setPanes).toHaveBeenLastCalledWith([expect.objectContaining({ radius: 350 })])
  })

  it('disposes once and does not update a destroyed scene', () => {
    const { instance } = create()
    instance.setGeometry(geometry)
    vi.clearAllMocks()
    instance.destroy()
    instance.destroy()
    instance.setOptions(options)
    instance.setGeometry(geometry)
    instance.setPointer(60, 400)
    expect(scene.destroy).toHaveBeenCalledTimes(1)
    expect(scene.setSourceOptions).not.toHaveBeenCalled()
    expect(scene.setPanes).not.toHaveBeenCalled()
    expect(scene.setPointer).not.toHaveBeenCalled()
  })

  it('preserves the shared renderer fallback signal', () => {
    scene.create.mockReturnValueOnce(null)
    expect(createAuthSceneRenderer(document.createElement('canvas'), options)).toBeNull()
  })
})
