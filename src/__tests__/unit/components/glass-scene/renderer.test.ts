import { FrontSide, Mesh, Object3D, Texture } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MeshPhysicalMaterial, PerspectiveCamera, Scene } from 'three'
import type * as Three from 'three'
import type { GlassSceneSource } from '@/components/glass-scene/types'
import { createGlassSceneRenderer } from '@/components/glass-scene/renderer'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

const gpu = vi.hoisted(() => ({
  create: vi.fn(),
  render: vi.fn(),
  setSize: vi.fn(),
  dispose: vi.fn(),
  forceContextLoss: vi.fn(),
  environmentDispose: vi.fn(),
  debug: { onShaderError: undefined as (() => void) | undefined },
}))
vi.mock('three', async (importOriginal) => {
  const three = await importOriginal<typeof Three>()
  return {
    ...three,
    WebGLRenderer: class {
      debug = gpu.debug
      render = gpu.render
      setSize = gpu.setSize
      setPixelRatio = vi.fn()
      dispose = gpu.dispose
      forceContextLoss = gpu.forceContextLoss
      constructor() {
        gpu.create()
      }
    },
    PMREMGenerator: class {
      fromEquirectangular() {
        return { texture: new three.Texture(), dispose: gpu.environmentDispose }
      }
      dispose() {}
    },
  }
})

let pending: Map<number, FrameRequestCallback>
let nextFrame: number
let source: GlassSceneSource<{ color: string }>
let hidden: boolean
let intersections: IntersectionObserverCallback
const teardown = new Set<() => void>()

beforeEach(() => {
  vi.clearAllMocks()
  gpu.create.mockReset()
  gpu.render.mockReset()
  gpu.debug = { onShaderError: undefined }
  pending = new Map()
  nextFrame = 0
  hidden = false
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    pending.set(++nextFrame, callback)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id))
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersections = callback
      }
      observe() {}
      disconnect() {}
    },
  )
  source = {
    object: new Object3D(),
    update: vi.fn(),
    resize: vi.fn(),
    frame: vi.fn(() => false),
    setPanes: vi.fn(),
    setPointer: vi.fn(),
    dispose: vi.fn(),
  }
})
afterEach(() => {
  teardown.forEach((destroy) => destroy())
  teardown.clear()
  vi.unstubAllGlobals()
})
function advance(time: number) {
  const callbacks = [...pending.values()]
  pending.clear()
  callbacks.forEach((callback) => callback(time))
}
function setup() {
  const canvas = document.createElement('canvas')
  const onReady = vi.fn()
  const onError = vi.fn()
  const renderer = createGlassSceneRenderer(canvas, {
    source: () => source,
    sourceOptions: { color: '#ffffff' },
    motion: 'fluid',
    onReady,
    onError,
  })!
  if (renderer) teardown.add(renderer.destroy)
  return { renderer, canvas, onReady, onError }
}
const material = resolveGlassMaterial({ mode: 'light', intensity: 'balanced' })
const pane = { id: 'pane', x: 80, y: 80, width: 700, height: 600, radius: 24, material }

describe('shared transmission renderer', () => {
  it('renders several physical panes over one source with one renderer and fitted camera', () => {
    const { renderer, onReady } = setup()
    expect(onReady).not.toHaveBeenCalled()
    renderer.setSize(3440, 1440)
    renderer.setPanes([pane, { ...pane, id: 'sidebar', x: 8, width: 64 }])
    advance(0)
    expect(gpu.create).toHaveBeenCalledTimes(1)
    const [scene, camera] = gpu.render.mock.calls[0] as [Scene, PerspectiveCamera]
    const meshes = scene.children.filter((child) => child instanceof Mesh) as Array<Mesh>
    expect(meshes).toHaveLength(2)
    meshes.forEach((mesh) =>
      expect(mesh.material).toMatchObject({ transmission: 1, side: FrontSide }),
    )
    expect(scene.children).toContain(source.object)
    expect(scene.environment).toBeInstanceOf(Texture)
    expect(camera.isPerspectiveCamera).toBe(true)
    const [width, height] = gpu.setSize.mock.calls[0] as [number, number]
    expect(width * height).toBeLessThanOrEqual(2_000_000)
    expect(onReady).toHaveBeenCalledTimes(1)
    expect(pending.size).toBe(0)
    renderer.setSourceOptions({ color: '#eeeeee' })
    expect(source.update).toHaveBeenCalledWith({ color: '#eeeeee' })
  })

  it('keeps center pointer activity idle, wakes only at a pane edge and settles after exit', () => {
    const { renderer } = setup()
    renderer.setSize(1000, 800)
    renderer.setPanes([pane])
    advance(0)
    renderer.setPointer(400, 300)
    expect(source.setPointer).toHaveBeenCalledWith(400, 300, true)
    expect(pending.size).toBe(0)
    renderer.setPointer(80, 300)
    expect(pending.size).toBe(1)
    advance(40)
    renderer.setPointer(0, 0, false)
    for (let time = 80; time <= 1200; time += 40) advance(time)
    expect(pending.size).toBe(0)
    renderer.setPanes([{ ...pane, enabled: false }])
    advance(1300)
    renderer.setPointer(80, 300)
    expect(pending.size).toBe(0)
  })

  it('uses local optical normals without changing pane geometry or global thickness', () => {
    const { renderer } = setup()
    renderer.setSize(1000, 800)
    renderer.setPanes([pane])
    advance(0)
    const [scene] = gpu.render.mock.calls[0] as [Scene]
    const mesh = scene.children.find((child) => child instanceof Mesh) as Mesh
    const physical = mesh.material as MeshPhysicalMaterial
    const geometry = mesh.geometry
    renderer.setInteraction('pane', { phase: 'press', input: 'touch', x: 80, y: 300, time: 0 })
    advance(40)
    expect(physical.normalMap).toBeTruthy()
    expect(physical.normalScale.x).toBe(1)
    expect(physical.thickness).toBe(pane.material.thickness)
    expect(mesh.geometry).toBe(geometry)
    for (let time = 80; time <= 360; time += 40) advance(time)
    renderer.setInteraction('pane', { phase: 'press', input: 'touch', x: 80, y: 300, time: 365 })
    expect(pending.size).toBe(0)
    renderer.setInteraction('pane', { phase: 'release', input: 'touch', x: 80, y: 300, time: 370 })
    for (let time = 400; time <= 760; time += 40) advance(time)
    expect(physical.normalScale.x).toBe(0)
    expect(pending.size).toBe(0)
  })

  it('limits contact to one active and one settling pane and resets immediately for Off', () => {
    const { renderer } = setup()
    renderer.setSize(1200, 800)
    renderer.setPanes([pane, { ...pane, id: 'second', x: 300 }, { ...pane, id: 'third', x: 500 }])
    advance(0)
    const [scene] = gpu.render.mock.calls[0] as [Scene]
    const materials = scene.children
      .filter((child) => child instanceof Mesh)
      .map((mesh) => mesh.material as MeshPhysicalMaterial)
    const move = (id: string, x: number, time: number) =>
      renderer.setInteraction(id, { phase: 'move', input: 'mouse', x, y: 300, time })
    move('pane', 80, 0)
    advance(40)
    move('second', 300, 45)
    advance(80)
    expect(materials.map((physical) => physical.normalScale.x)).toEqual([1, 1, 0])
    move('third', 500, 85)
    advance(120)
    expect(materials.map((physical) => physical.normalScale.x)).toEqual([0, 1, 1])
    renderer.setInteraction('pane', { phase: 'reset', input: 'keyboard', x: 0, y: 0, time: 125 })
    expect(materials[2].normalScale.x).toBe(1)
    renderer.setMotion('off')
    advance(160)
    expect(materials.every((physical) => physical.normalScale.x === 0)).toBe(true)
    expect(pending.size).toBe(0)
  })

  it('gates animation on both document and canvas visibility', () => {
    const { renderer } = setup()
    renderer.setSize(1000, 800)
    advance(0)
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    renderer.invalidate()
    expect(pending.size).toBe(0)
    intersections(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(pending.size).toBe(0)
    intersections(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    expect(pending.size).toBe(1)
    advance(500)
    expect(gpu.render).toHaveBeenCalledTimes(2)
  })

  it('returns to fallback on context loss and disposes every resource only once', () => {
    const { renderer, canvas, onError } = setup()
    renderer.setSize(1000, 800)
    renderer.setPanes([pane])
    advance(0)
    const [scene] = gpu.render.mock.calls[0] as [Scene]
    const mesh = scene.children.find((child) => child instanceof Mesh) as Mesh
    const disposeGeometry = vi.spyOn(mesh.geometry, 'dispose')
    const disposeMaterial = vi.spyOn(mesh.material as object & { dispose: () => void }, 'dispose')
    const disposeNormal = vi.spyOn((mesh.material as MeshPhysicalMaterial).normalMap!, 'dispose')
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    renderer.destroy()
    renderer.invalidate()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(disposeGeometry).toHaveBeenCalledTimes(1)
    expect(disposeMaterial).toHaveBeenCalledTimes(1)
    expect(disposeNormal).toHaveBeenCalledTimes(1)
    expect(source.dispose).toHaveBeenCalledTimes(1)
    expect(gpu.environmentDispose).toHaveBeenCalledTimes(1)
    expect(gpu.dispose).toHaveBeenCalledTimes(1)
    expect(pending.size).toBe(0)
  })

  it('never publishes readiness after a failed shader compilation', () => {
    const { renderer, onReady, onError } = setup()
    gpu.render.mockImplementationOnce(() => gpu.debug.onShaderError?.())
    renderer.setSize(1000, 800)
    advance(0)
    expect(onReady).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(gpu.dispose).toHaveBeenCalledTimes(1)
  })

  it('handles unavailable WebGL before publishing an instance', () => {
    gpu.create.mockImplementationOnce(() => {
      throw new Error('WebGL unavailable')
    })
    const { renderer, onError } = setup()
    expect(renderer).toBeNull()
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
