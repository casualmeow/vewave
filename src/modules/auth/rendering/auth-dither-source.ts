import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector2,
  Vector4,
} from 'three'
import { authSceneFragmentShader, authSceneVertexShader } from './auth-scene-shaders'
import type { AuthSceneOptions } from './auth-scene-renderer'
import type { GlassSceneSourceFactory } from '@/components/glass-scene/types'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'
import { createGlassInteractionController } from '@/shared/lib/glass-interaction'

export const createAuthDitherSource: GlassSceneSourceFactory<AuthSceneOptions> = (
  initial,
  context,
) => {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  geometry.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))
  const uniforms = {
    uSize: { value: new Vector2(context.width, context.height) },
    uPlate: { value: new Vector4(0, 0, 1, 1) },
    uRadius: { value: 0 },
    uBackground: { value: new Color(initial.palette.background) },
    uCard: { value: new Color(initial.palette.card) },
    uAccent: { value: new Color(initial.palette.accent) },
    uDark: { value: initial.mode === 'dark' ? 1 : 0 },
    uSolid: { value: initial.surfaceStyle === 'solid' ? 1 : 0 },
    uPointer: { value: new Vector2(0, 0) },
    uPointerAmount: { value: 0 },
    uEdgePulse: { value: 0 },
    uEdgePhase: { value: 1 },
  }
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: authSceneVertexShader,
    fragmentShader: authSceneFragmentShader,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const object = new Mesh(geometry, material)
  object.frustumCulled = false
  object.renderOrder = -1000
  let options = initial
  let disposed = false
  let plate: { x: number; y: number; width: number; height: number; radius: number } | null = null
  let lastTime: number | null = null
  const interaction = createGlassInteractionController({
    motion: initial.motion,
    geometry: { width: 1, height: 1, radius: 0 },
  })

  function reset() {
    interaction.reset()
    lastTime = null
    uniforms.uPointerAmount.value = 0
    uniforms.uEdgePulse.value = 0
    uniforms.uEdgePhase.value = 1
  }

  function setInteraction(event: GlassInteractionEvent) {
    if (disposed || !plate) return
    const previous = interaction.step(0)
    interaction.input({ ...event, x: event.x - plate.x, y: event.y - plate.y })
    if (event.phase === 'reset') reset()
    const next = interaction.step(0)
    if (next.active || previous.energy !== next.energy || previous.pressure !== next.pressure)
      context.invalidate()
  }

  return {
    object,
    update(next) {
      if (disposed) return
      options = next
      uniforms.uBackground.value.set(next.palette.background)
      uniforms.uCard.value.set(next.palette.card)
      uniforms.uAccent.value.set(next.palette.accent)
      uniforms.uDark.value = next.mode === 'dark' ? 1 : 0
      uniforms.uSolid.value = next.surfaceStyle === 'solid' ? 1 : 0
      interaction.setMotion(next.motion)
      if (next.motion === 'off') reset()
    },
    resize(width, height) {
      if (disposed) return
      uniforms.uSize.value.set(width, height)
      reset()
    },
    setPanes(panes) {
      if (disposed) return
      const next = panes.find((pane) => pane.id === 'auth-plate') ?? null
      if (
        next?.x !== plate?.x ||
        next?.y !== plate?.y ||
        next?.width !== plate?.width ||
        next?.height !== plate?.height ||
        next?.radius !== plate?.radius
      ) {
        reset()
      }
      plate = next
      if (plate) {
        interaction.setGeometry(plate)
        uniforms.uPlate.value.set(plate.x, plate.y, plate.width, plate.height)
        uniforms.uRadius.value = plate.radius
      }
    },
    frame(time) {
      if (disposed || !plate) return false
      const delta = lastTime === null ? 1000 / 30 : Math.min(50, Math.max(0, time - lastTime))
      lastTime = time
      const state = interaction.step(delta)
      uniforms.uPointer.value.set(plate.x + state.x, plate.y + state.y)
      uniforms.uPointerAmount.value = state.energy
      uniforms.uEdgePhase.value = state.progress ?? 1
      uniforms.uEdgePulse.value = state.active
        ? (state.energy + state.pressure * 0.2) * Math.pow(1 - (state.progress ?? 1), 2)
        : 0
      return state.active
    },
    setInteraction,
    setPointer(x, y, active = true) {
      if (options.motion === 'off' || !Number.isFinite(x) || !Number.isFinite(y)) return
      setInteraction({
        phase: active ? 'move' : 'exit',
        input: 'mouse',
        x,
        y,
        time: performance.now(),
      })
    },
    dispose() {
      if (disposed) return
      disposed = true
      geometry.dispose()
      material.dispose()
    },
  }
}
