import { BufferGeometry, Color, Float32BufferAttribute, Mesh, ShaderMaterial } from 'three'
import { backdropFragmentShader, backdropVertexShader } from './shaders'
import type { BackdropRendererOptions } from './renderer'
import type { GlassSceneSourceFactory } from '@/components/glass-scene'

export const createBackdropSceneSource: GlassSceneSourceFactory<BackdropRendererOptions> = (
  initial,
) => {
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
  const object = new Mesh(geometry, material)
  object.frustumCulled = false
  object.renderOrder = -1000
  let options = initial
  let lastFrame = 0
  const update = (next: BackdropRendererOptions) => {
    options = next
    uniforms.uBase.value.set(next.palette.base)
    uniforms.uFirst.value.set(next.palette.first)
    uniforms.uSecond.value.set(next.palette.second)
    uniforms.uPreset.value = { none: -1, ribbons: 0, silk: 1, contours: 2 }[next.settings.preset]
  }
  update(initial)
  return {
    object,
    update,
    resize(width, height) {
      uniforms.uAspect.value = width / Math.max(1, height)
    },
    frame(elapsedMs) {
      const delta = lastFrame ? Math.min(0.05, Math.max(0, (elapsedMs - lastFrame) / 1000)) : 0
      lastFrame = elapsedMs
      const animated =
        options.animated && options.settings.speed > 0 && options.settings.preset !== 'none'
      if (animated) uniforms.uTime.value += delta * (0.025 + options.settings.speed * 0.24)
      return animated
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
