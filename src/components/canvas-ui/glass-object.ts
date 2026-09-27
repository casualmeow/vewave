import * as THREE from 'three'
import { createSvgObjectModel } from './svg-object-model'
import { createObjectFrameLoop, objectPixelRatio } from './object-frame-loop'
import { createAuthScene } from './auth-scene'

export interface GlassObjectOptions {
  src: string
  material: 'glass' | 'matte'

  composition?: 'object' | 'auth'

  pathColors?: Readonly<Record<string, string>>
  background: string
  highlight: string
  environmentIntensity: number
  motion: 'off' | 'subtle' | 'fluid'

  onLoad?: () => void
  onError?: (error: unknown) => void
}

export interface GlassObjectInstance {
  setOptions: (options: Partial<GlassObjectOptions>) => void

  setPointer: (x: number, y: number) => void
  destroy: () => void
}

interface FormerDef {
  kind: 'ring' | 'box'
  intensity: number
  position: [number, number, number]
  scale: [number, number, number]
  lookAtCenter?: boolean
  withLight?: boolean
}

const ROOM_BLOCKS: Array<{
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}> = [
  {
    position: [-10.906, -1, 1.846],
    rotation: [0, -0.195, 0],
    scale: [2.328, 7.905, 4.651],
  },
  {
    position: [-5.607, -0.754, -0.758],
    rotation: [0, 0.994, 0],
    scale: [1.97, 1.534, 3.955],
  },
  {
    position: [6.167, -0.16, 7.803],
    rotation: [0, 0.561, 0],
    scale: [3.927, 6.285, 3.687],
  },
  {
    position: [-2.017, 0.018, 6.124],
    rotation: [0, 0.333, 0],
    scale: [2.002, 4.566, 2.064],
  },
  {
    position: [2.291, -0.756, -2.621],
    rotation: [0, -0.286, 0],
    scale: [1.546, 1.552, 1.496],
  },
  {
    position: [-2.193, -0.369, -5.547],
    rotation: [0, 0.516, 0],
    scale: [3.875, 3.487, 2.986],
  },
]

const ROOM_FORMERS: Array<FormerDef> = [
  {
    kind: 'ring',
    intensity: 15,
    position: [2, 3, -2],
    scale: [10, 10, 10],
    lookAtCenter: true,
  },
  {
    kind: 'box',
    intensity: 80,
    position: [-14, 10, 8],
    scale: [0.1, 2.5, 2.5],
  },
  {
    kind: 'box',
    intensity: 80,
    position: [-14, 14, -4],
    scale: [0.1, 2.5, 2.5],
    withLight: true,
  },
  {
    kind: 'box',
    intensity: 23,
    position: [14, 12, 0],
    scale: [0.1, 5, 5],
    withLight: true,
  },
  {
    kind: 'box',
    intensity: 16,
    position: [0, 9, 14],
    scale: [5, 5, 0.1],
    withLight: true,
  },
  {
    kind: 'box',
    intensity: 80,
    position: [7, 8, -14],
    scale: [2.5, 2.5, 0.1],
    withLight: true,
  },
  {
    kind: 'box',
    intensity: 80,
    position: [-7, 16, -14],
    scale: [2.5, 2.5, 0.1],
    withLight: true,
  },
  {
    kind: 'box',
    intensity: 1,
    position: [0, 20, 0],
    scale: [0.1, 0.1, 0.1],
    withLight: true,
  },
  {
    kind: 'box',
    intensity: 20,
    position: [0, 15, 0],
    scale: [10, 1, 10],
    withLight: true,
  },
]

function disposeObject(root: THREE.Object3D) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!material) continue
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}

export function createGlassObject(
  canvas: HTMLCanvasElement,
  options: GlassObjectOptions,
): GlassObjectInstance | null {
  const config = { ...options }
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    })
  } catch {
    return null
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, -0.15, 5)
  camera.lookAt(0, 0, 0)
  const object = new THREE.Group()
  scene.add(object)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
  keyLight.position.set(-2, 3, 5)
  scene.add(keyLight, new THREE.HemisphereLight(0xffffff, 0x667280, 0.8))
  const pmrem = new THREE.PMREMGenerator(renderer)
  let roomScene: THREE.Scene | null = null
  let ringMaterial: THREE.MeshBasicMaterial | null = null
  let envTarget: THREE.WebGLRenderTarget | null = null
  let envDirty = true
  let model: ReturnType<typeof createSvgObjectModel> | null = null
  let authScene: ReturnType<typeof createAuthScene> | null = null
  let disposed = false
  let failed = false
  let ready = false
  let loadToken = 0
  let loadController: AbortController | null = null
  let inView = typeof IntersectionObserver === 'undefined'
  const target = new THREE.Vector2()
  let lastTime = 0
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  function buildRoom() {
    roomScene = new THREE.Scene()
    const room = new THREE.Group()
    room.position.set(0, -0.5, 0)
    roomScene.add(room)

    for (const [x, z] of [
      [-15, 15],
      [15, 15],
      [15, -15],
      [-15, -15],
    ]) {
      const spot = new THREE.SpotLight(0xffffff, 2, 0, 0.2, 1, 0)
      spot.position.set(x, 20, z)
      room.add(spot, spot.target)
    }
    const center = new THREE.PointLight(0xffffff, 100, 28, 2)
    center.position.set(0.5, 14, 0.5)
    room.add(center)

    const box = new THREE.BoxGeometry()
    const shell = new THREE.Mesh(
      box,
      new THREE.MeshStandardMaterial({ color: 'gray', side: THREE.BackSide }),
    )
    shell.position.set(0, 13.2, 0)
    shell.scale.set(31.5, 28.5, 31.5)
    room.add(shell)

    const white = new THREE.MeshStandardMaterial({ color: 0xffffff })
    for (const def of ROOM_BLOCKS) {
      const roomMesh = new THREE.Mesh(box, white)
      roomMesh.position.set(...def.position)
      roomMesh.rotation.set(...def.rotation)
      roomMesh.scale.set(...def.scale)
      room.add(roomMesh)
    }

    for (const def of ROOM_FORMERS) {
      const geometry =
        def.kind === 'ring' ? new THREE.RingGeometry(0.5, 1, 64) : new THREE.BoxGeometry()
      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      material.color
        .set(def.kind === 'ring' ? config.highlight : '#ffffff')
        .multiplyScalar(def.intensity)
      if (def.kind === 'ring') ringMaterial = material
      const roomMesh = new THREE.Mesh(geometry, material)
      roomMesh.position.set(...def.position)
      roomMesh.scale.set(...def.scale)
      if (def.lookAtCenter) roomMesh.lookAt(0, 0, 0)
      room.add(roomMesh)
      if (def.withLight) {
        const light = new THREE.PointLight(0xffffff, 100, 28, 2)
        light.position.set(...def.position)
        room.add(light)
      }
    }
  }

  function refreshEnvironment() {
    if (!roomScene) buildRoom()
    ringMaterial?.color.set(config.highlight).multiplyScalar(4)
    envTarget?.dispose()
    envTarget = pmrem.fromScene(roomScene!, 0.6, 0.1, 1000)
    scene.environment = envTarget.texture
    envDirty = false
  }

  function fail(error: unknown) {
    if (failed || disposed) return
    failed = true
    loop.dispose()
    config.onError?.(error)
  }

  const loop = createObjectFrameLoop({
    render(time) {
      if (disposed || failed) return false
      try {
        if (envDirty) refreshEnvironment()
        const delta = lastTime ? Math.min(time - lastTime, 50) : 1000 / 30
        lastTime = time
        const motion = motionQuery.matches ? 'off' : config.motion
        const limit = THREE.MathUtils.degToRad(motion === 'fluid' ? 4 : motion === 'subtle' ? 2 : 0)
        const x = -target.y * limit
        const y = target.x * limit
        const blend = motion === 'off' ? 1 : 1 - Math.exp(-delta / (motion === 'fluid' ? 75 : 45))
        object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, x, blend)
        object.rotation.y = THREE.MathUtils.lerp(object.rotation.y, y, blend)
        const moving = Math.abs(object.rotation.x - x) + Math.abs(object.rotation.y - y) > 0.0002
        if (!moving) object.rotation.set(x, y, 0)
        renderer.render(scene, camera)
        if (failed || disposed) return false
        if (model && !ready) {
          ready = true
          config.onLoad?.()
        }
        return moving
      } catch (error) {
        fail(error)
        return false
      }
    },
  })

  function applyOptions() {
    const auth = config.composition === 'auth'
    if (auth && !authScene) {
      authScene = createAuthScene()
      object.add(authScene.lens)
      scene.add(authScene.backdrop)
    }
    if (authScene) {
      authScene.setAppearance(config.material, config)
      authScene.lens.visible = auth && config.material === 'glass'
      authScene.backdrop.visible = auth
    }

    model?.setAppearance(auth ? 'matte' : config.material, config.pathColors)
    camera.position.y = auth ? 0 : -0.15
    camera.lookAt(0, 0, 0)
    fit()
    scene.environmentIntensity = config.environmentIntensity
    renderer.setClearColor(config.background, 1)
    scene.background = new THREE.Color(config.background)
    if (config.motion === 'off' || motionQuery.matches) target.set(0, 0)
    loop.invalidate()
  }

  function fit() {
    const height = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    const width = height * camera.aspect
    if (config.composition === 'auth') {
      object.position.set(width * -0.23, height * 0.08, 0)
      object.scale.setScalar(width * 0.36)
      authScene?.fit(width, height, camera.position.z)
    } else {
      object.position.set(0, 0, 0)
      object.scale.setScalar(Math.min(width * 0.82, 4.8))
    }
  }

  function resize() {
    if (disposed || failed) return
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    renderer.setPixelRatio(objectPixelRatio(width, height, window.devicePixelRatio))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    fit()
    loop.invalidate()
  }

  async function loadAsset() {
    const token = ++loadToken
    loadController?.abort()
    loadController = new AbortController()
    ready = false
    try {
      const response = await fetch(config.src, { signal: loadController.signal })
      if (!response.ok) throw new Error('Unable to load the Vewave mark')
      const source = await response.text()
      if (disposed || token !== loadToken) return
      const next = createSvgObjectModel(source)
      next.setAppearance(
        config.composition === 'auth' ? 'matte' : config.material,
        config.pathColors,
      )
      if (model) {
        object.remove(model.group)
        model.dispose()
      }
      model = next
      object.add(model.group)
      loop.invalidate()
    } catch (error) {
      if (!disposed && token === loadToken) fail(error)
    }
  }

  const onMotionChange = () => {
    applyOptions()
  }
  const onVisibilityChange = () => {
    lastTime = 0
    loop.setVisible(inView && !document.hidden)
  }
  const onContextLost = (event: Event) => {
    event.preventDefault()
    fail(new Error('WebGL context lost'))
  }
  const observer = new ResizeObserver(resize)
  const viewObserver =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          inView = entries[entries.length - 1]?.isIntersecting ?? false
          onVisibilityChange()
        })
  observer.observe(canvas)
  viewObserver?.observe(canvas)
  document.addEventListener('visibilitychange', onVisibilityChange)
  canvas.addEventListener('webglcontextlost', onContextLost)
  motionQuery.addEventListener('change', onMotionChange)
  onVisibilityChange()
  resize()
  applyOptions()
  void loadAsset()

  return {
    setOptions(next) {
      if (disposed || failed) return
      const previousSrc = config.src
      if (next.highlight && next.highlight !== config.highlight) envDirty = true
      Object.assign(config, next)
      applyOptions()
      if (config.src !== previousSrc) void loadAsset()
    },
    setPointer(x, y) {
      if (disposed || failed || config.motion === 'off' || motionQuery.matches) return
      target.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1))
      loop.invalidate()
    },
    destroy() {
      if (disposed) return
      disposed = true
      loadToken += 1
      loadController?.abort()
      loop.dispose()
      observer.disconnect()
      viewObserver?.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      model?.dispose()
      authScene?.dispose()
      if (roomScene) disposeObject(roomScene)
      envTarget?.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
