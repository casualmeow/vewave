import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { createBackdropFrameLoop, getBackdropBufferSize } from './frame-loop'
import { backdropFragmentShader, backdropVertexShader } from './shaders'
import type { BackdropPalette } from './palette'
import type { BackgroundSettings } from '@/shared/theme/contract'

export type BackdropRendererOptions = {
  settings: BackgroundSettings
  palette: BackdropPalette
  animated: boolean
  maxPixels?: number
}

export function createBackdropRenderer(
  canvas: HTMLCanvasElement,
  initial: BackdropRendererOptions,
  onFailure: () => void,
) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: 'low-power',
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  geometry.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))
  const uniforms = {
    uBase: { value: new Color(initial.palette.base) },
    uFirst: { value: new Color(initial.palette.first) },
    uSecond: { value: new Color(initial.palette.second) },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uPreset: { value: 0 },
  }
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: backdropVertexShader,
    fragmentShader: backdropFragmentShader,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const scene = new Scene()
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  scene.add(mesh)
  const camera = new OrthographicCamera()
  let options = initial
  let disposed = false
  let previousSeconds = 0
  let phase = 0
  const loop = createBackdropFrameLoop({
    requestFrame: requestAnimationFrame,
    cancelFrame: cancelAnimationFrame,
    render(seconds) {
      if (disposed) return
      phase += (seconds - previousSeconds) * (0.025 + options.settings.speed * 0.24)
      previousSeconds = seconds
      uniforms.uTime.value = phase
      try {
        renderer.render(scene, camera)
      } catch {
        fail()
      }
    },
  })
  const policy = () =>
    loop.setPolicy({
      visible: !document.hidden,
      animated: options.animated && options.settings.speed > 0,
    })
  const resize = () => {
    if (disposed) return
    const { width, height } = canvas.getBoundingClientRect()
    const size = getBackdropBufferSize(width, height, window.devicePixelRatio || 1)
    const budgetScale = Math.min(
      1,
      Math.sqrt((options.maxPixels ?? 800_000) / (size.width * size.height)),
    )
    size.width = Math.max(1, Math.floor(size.width * budgetScale))
    size.height = Math.max(1, Math.floor(size.height * budgetScale))
    renderer.setSize(size.width, size.height, false)
    uniforms.uAspect.value = width / Math.max(1, height)
    loop.invalidate()
  }
  const update = (next: BackdropRendererOptions) => {
    if (disposed) return
    options = next
    uniforms.uBase.value.set(next.palette.base)
    uniforms.uFirst.value.set(next.palette.first)
    uniforms.uSecond.value.set(next.palette.second)
    uniforms.uPreset.value = { none: 0, ribbons: 0, silk: 1, contours: 2 }[next.settings.preset]
    policy()
  }
  const observer = new ResizeObserver(resize)
  function dispose() {
    if (disposed) return
    disposed = true
    loop.dispose()
    observer.disconnect()
    document.removeEventListener('visibilitychange', policy)
    window.removeEventListener('resize', resize)
    canvas.removeEventListener('webglcontextlost', fail)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
  function fail() {
    dispose()
    onFailure()
  }
  renderer.debug.onShaderError = fail
  canvas.addEventListener('webglcontextlost', fail)
  document.addEventListener('visibilitychange', policy)
  window.addEventListener('resize', resize)
  observer.observe(canvas)
  update(initial)
  resize()
  return { update, dispose }
}
