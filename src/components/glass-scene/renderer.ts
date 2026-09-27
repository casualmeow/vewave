import {
  DataTexture,
  EquirectangularReflectionMapping,
  FrontSide,
  Mesh,
  MeshPhysicalMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  RGBAFormat,
  Scene,
  SRGBColorSpace,
  UnsignedByteType,
  WebGLRenderer,
} from 'three'
import {
  createScenePaneGeometry,
  sceneBufferSize,
  sceneCameraDistance,
  sceneCameraFov,
} from './geometry'
import { createSceneNormalPatch, scenePaneDistance } from './normal-patch'
import type {
  GlassSceneRenderer,
  GlassSceneRendererOptions,
  GlassSceneSource,
  ScenePane,
} from './types'
import type { BufferGeometry, WebGLRenderTarget } from 'three'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'
import { createObjectFrameLoop } from '@/components/canvas-ui/object-frame-loop'
import { createGlassInteractionController } from '@/shared/lib/glass-interaction'

type PaneEntry = {
  pane: ScenePane
  geometryKey: string
  mesh: Mesh<BufferGeometry, MeshPhysicalMaterial>
  interaction: ReturnType<typeof createGlassInteractionController>
  patch: ReturnType<typeof createSceneNormalPatch>
}

function createEnvironment(renderer: WebGLRenderer) {
  const width = 128
  const height = 64
  const pixels = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const softbox = Math.exp(-(((x - 34) / 15) ** 2 + ((y - 18) / 9) ** 2))
      const fill = Math.exp(-(((x - 104) / 24) ** 2 + ((y - 25) / 15) ** 2))
      const value = Math.min(255, Math.round(75 + softbox * 175 + fill * 65))
      pixels.set([value, value, value, 255], (y * width + x) * 4)
    }
  }
  const texture = new DataTexture(pixels, width, height, RGBAFormat, UnsignedByteType)
  texture.mapping = EquirectangularReflectionMapping
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  const generator = new PMREMGenerator(renderer)
  try {
    return generator.fromEquirectangular(texture)
  } finally {
    texture.dispose()
    generator.dispose()
  }
}

export function createGlassSceneRenderer<T>(
  canvas: HTMLCanvasElement,
  initial: GlassSceneRendererOptions<T>,
): GlassSceneRenderer<T> | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: 'low-power',
    })
  } catch {
    initial.onError?.()
    return null
  }
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NoToneMapping
  renderer.transmissionResolutionScale = 0.75
  const scene = new Scene()
  const camera = new PerspectiveCamera(1, 1, sceneCameraDistance / 2, sceneCameraDistance * 1.5)
  camera.position.z = sceneCameraDistance
  const panes = new Map<string, PaneEntry>()
  let source: GlassSceneSource<T> | null = null
  let environment: WebGLRenderTarget | null = null
  let width = 0
  let height = 0
  let bufferWidth = 0
  let bufferHeight = 0
  let inView = true
  let disposed = false
  let ready = false
  let paused = false
  let elapsed = 0
  let previousTime: number | null = null
  let motion = initial.motion ?? 'off'
  let activePane: string | null = null
  let settlingPane: string | null = null

  const loop = createObjectFrameLoop({
    render(time) {
      if (disposed || !source || width <= 0 || height <= 0) return false
      const delta = previousTime === null ? 1000 / 30 : Math.min(50, time - previousTime)
      previousTime = time
      if (!paused) elapsed += delta
      try {
        let moving = paused ? false : (source.frame?.(elapsed) ?? false)
        for (const entry of panes.values()) {
          if (entry.pane.id !== activePane && entry.pane.id !== settlingPane) continue
          const frame = entry.interaction.step(delta)
          const responding = entry.mesh.visible && frame.bend > 0 && !paused && motion !== 'off'
          if (responding) entry.patch.update(entry.pane, frame, entry.pane.contentInset)
          entry.mesh.material.normalScale.setScalar(responding ? 1 : 0)
          moving ||= frame.active && !paused
          if (!frame.active && frame.energy === 0 && entry.pane.id === settlingPane)
            settlingPane = null
        }

        renderer.render(scene, camera)
        if (disposed) return false
        if (!ready) {
          ready = true
          initial.onReady?.()
        }
        if (!disposed) initial.onFrame?.()
        return !disposed && moving
      } catch {
        fail()
        return false
      }
    },
  })

  function visibility() {
    previousTime = null
    if (!inView || document.hidden) resetInteractions()
    loop.setVisible(width > 0 && height > 0 && inView && !document.hidden)
  }

  function resetEntry(entry: PaneEntry) {
    entry.interaction.reset()
    entry.mesh.material.normalScale.setScalar(0)
  }

  function resetInteractions() {
    for (const entry of panes.values()) resetEntry(entry)
    activePane = null
    settlingPane = null
  }

  function releaseActive(event: GlassInteractionEvent) {
    if (!activePane) return
    const previous = panes.get(activePane)
    if (settlingPane && settlingPane !== activePane) {
      const old = panes.get(settlingPane)
      if (old) resetEntry(old)
    }
    if (previous) {
      previous.interaction.input({
        ...event,
        phase: 'exit',
        x: event.x - previous.pane.x,
        y: event.y - previous.pane.y,
      })
      settlingPane = activePane
    }
    activePane = null
    loop.invalidate()
  }

  function setInteraction(id: string | null, event: GlassInteractionEvent) {
    if (disposed || ![event.x, event.y, event.time].every(Number.isFinite)) return
    try {
      if (source?.setInteraction) source.setInteraction(event)
      else
        source?.setPointer?.(
          event.x,
          event.y,
          event.phase === 'move' || event.phase === 'enter' || event.phase === 'press',
        )
      if (event.phase === 'reset' || event.input === 'keyboard' || motion === 'off' || paused) {
        const changed = activePane !== null || settlingPane !== null
        if (id && motion !== 'off' && !paused) {
          const entry = panes.get(id)
          if (entry) resetEntry(entry)
          if (activePane === id) activePane = null
          if (settlingPane === id) settlingPane = null
        } else resetInteractions()
        if (changed) loop.invalidate()
        return
      }
      const entry = id ? panes.get(id) : undefined
      if (!entry?.mesh.visible || event.phase === 'exit') {
        if (id === null || activePane === id) releaseActive(event)
        return
      }
      if (activePane !== id) {
        releaseActive(event)
        if (settlingPane === id) settlingPane = null
        activePane = id
      }
      entry.interaction.input({ ...event, x: event.x - entry.pane.x, y: event.y - entry.pane.y })
      const frame = entry.interaction.step(0)
      if (frame.active || frame.bend > 0 !== entry.mesh.material.normalScale.x > 0)
        loop.invalidate()
    } catch {
      fail()
    }
  }

  function applyMaterial(entry: PaneEntry) {
    const material = entry.pane.material
    Object.assign(entry.mesh.material, {
      ior: material.ior,
      roughness: material.roughness,
      thickness: material.thickness,
      dispersion: material.dispersion,
      transmission: 1,
      opacity: 1,
      metalness: 0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.2,
      envMapIntensity: material.bodyReflection * 5,
      attenuationDistance: material.thickness / Math.max(material.tintOpacity * 0.06, 0.001),
    })
    entry.mesh.material.attenuationColor.set(material.tintColor)
  }

  function place(entry: PaneEntry) {
    const pane = entry.pane
    entry.mesh.position.set(
      pane.x + pane.width / 2 - width / 2,
      height / 2 - pane.y - pane.height / 2,
      0,
    )
    entry.mesh.visible =
      pane.enabled !== false &&
      pane.x < width &&
      pane.y < height &&
      pane.x + pane.width > 0 &&
      pane.y + pane.height > 0
  }

  function setPanes(next: ReadonlyArray<ScenePane>) {
    if (disposed) return
    try {
      const retained = new Set<string>()
      for (const pane of next) {
        if (
          ![pane.x, pane.y, pane.width, pane.height, pane.radius].every(Number.isFinite) ||
          pane.width <= 1 ||
          pane.height <= 1
        )
          continue
        retained.add(pane.id)
        const geometryKey = `${pane.width}:${pane.height}:${pane.radius}:${pane.material.bevel}:${pane.material.thickness}`
        let entry = panes.get(pane.id)
        if (!entry) {
          const mesh = new Mesh(
            createScenePaneGeometry(pane),
            new MeshPhysicalMaterial({ side: FrontSide }),
          )
          mesh.frustumCulled = false
          mesh.material.transmission = 1
          const patch = createSceneNormalPatch()
          mesh.material.normalMap = patch.texture
          mesh.material.normalScale.setScalar(0)
          entry = {
            pane,
            mesh,
            geometryKey,
            patch,
            interaction: createGlassInteractionController({ motion, geometry: pane }),
          }
          panes.set(pane.id, entry)
          scene.add(mesh)
        } else {
          const moved = entry.pane.x !== pane.x || entry.pane.y !== pane.y
          entry.pane = pane
          if (entry.geometryKey !== geometryKey) {
            entry.mesh.geometry.dispose()
            entry.mesh.geometry = createScenePaneGeometry(pane)
            entry.geometryKey = geometryKey
            entry.interaction.setGeometry(pane)
            resetEntry(entry)
          }
          if (moved || pane.enabled === false) resetEntry(entry)
        }
        applyMaterial(entry)
        place(entry)
      }
      for (const [id, entry] of panes) {
        if (retained.has(id)) continue
        scene.remove(entry.mesh)
        entry.mesh.geometry.dispose()
        entry.mesh.material.dispose()
        entry.patch.dispose()
        panes.delete(id)
        if (activePane === id) activePane = null
        if (settlingPane === id) settlingPane = null
      }
      source?.setPanes?.(next)
      loop.invalidate()
    } catch {
      fail()
    }
  }

  function setSize(nextWidth: number, nextHeight: number) {
    if (disposed) return
    const previousWidth = width
    const previousHeight = height
    width = Number.isFinite(nextWidth) ? Math.max(0, nextWidth) : 0
    height = Number.isFinite(nextHeight) ? Math.max(0, nextHeight) : 0
    if (width <= 0 || height <= 0) {
      visibility()
      return
    }
    try {
      const size = sceneBufferSize(width, height, window.devicePixelRatio)
      if (
        width === previousWidth &&
        height === previousHeight &&
        size.width === bufferWidth &&
        size.height === bufferHeight
      )
        return
      bufferWidth = size.width
      bufferHeight = size.height
      renderer.setPixelRatio(1)
      renderer.setSize(size.width, size.height, false)
      camera.aspect = width / height
      camera.fov = sceneCameraFov(height)
      camera.updateProjectionMatrix()
      for (const entry of panes.values()) place(entry)
      source?.resize?.(width, height)
      visibility()
    } catch {
      fail()
    }
  }

  const viewObserver =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          inView = entries[entries.length - 1]?.isIntersecting ?? false
          visibility()
        })
  function contextLost(event: Event) {
    event.preventDefault()
    fail()
  }
  function destroy() {
    if (disposed) return
    disposed = true
    loop.dispose()
    viewObserver?.disconnect()
    document.removeEventListener('visibilitychange', visibility)
    canvas.removeEventListener('webglcontextlost', contextLost)
    source?.dispose()
    for (const entry of panes.values()) {
      entry.mesh.geometry.dispose()
      entry.mesh.material.dispose()
      entry.patch.dispose()
    }
    panes.clear()
    environment?.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
  function fail() {
    if (!disposed) {
      destroy()
      initial.onError?.()
    }
  }

  try {
    renderer.debug.onShaderError = fail
    environment = createEnvironment(renderer)
    if (disposed) {
      environment.dispose()
      return null
    }
    scene.environment = environment.texture
    source = initial.source(initial.sourceOptions, {
      width: 0,
      height: 0,
      invalidate: () => loop.invalidate(),
    })
    if (disposed) {
      source.dispose()
      return null
    }
    scene.add(source.object)
    source.object.renderOrder = -1000
    document.addEventListener('visibilitychange', visibility)
    canvas.addEventListener('webglcontextlost', contextLost)
    viewObserver?.observe(canvas)
    visibility()
  } catch {
    fail()
    return null
  }

  return {
    setPanes,
    setSize,
    setInteraction,
    setSourceOptions(options) {
      if (disposed) return
      try {
        source?.update(options)
        loop.invalidate()
      } catch {
        fail()
      }
    },
    setPointer(x, y, active = true) {
      if (disposed || !Number.isFinite(x) || !Number.isFinite(y)) return
      let nearest: string | null = null
      let distance = 40
      if (active)
        for (const [id, entry] of panes) {
          if (!entry.mesh.visible) continue
          const candidate = Math.abs(
            scenePaneDistance(x - entry.pane.x, y - entry.pane.y, entry.pane),
          )
          if (candidate < distance) {
            distance = candidate
            nearest = id
          }
        }
      setInteraction(nearest, {
        phase: active ? 'move' : 'exit',
        input: 'mouse',
        x,
        y,
        time: performance.now(),
      })
    },
    setPaused(value) {
      if (!disposed) {
        paused = value
        if (paused) resetInteractions()
        previousTime = null
        loop.invalidate()
      }
    },
    setMotion(value) {
      if (!disposed) {
        motion = value
        for (const entry of panes.values()) entry.interaction.setMotion(value)
        if (motion === 'off') resetInteractions()
        loop.invalidate()
      }
    },
    invalidate() {
      if (!disposed) loop.invalidate()
    },
    destroy,
  }
}
