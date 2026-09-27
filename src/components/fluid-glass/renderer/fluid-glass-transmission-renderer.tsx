import { Canvas } from '@react-three/fiber'
import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { LinearSRGBColorSpace, NoToneMapping } from 'three'

import { resolveFluidGlassQuality } from '../constants'
import { RendererErrorBoundary } from './renderer-error-boundary'
import { TransmissionScene } from './transmission-scene'
import type {
  FluidGlassDebugView,
  FluidGlassEnvironmentSource,
  FluidGlassMaterialPreset,
  FluidGlassQuality,
  FluidGlassTelemetry,
  FluidTransmissionMaterial,
} from '../types'
import type { LensStateAdapter } from '../lens/lens-state'
import type { RendererLifecycleController } from '../lens/renderer-lifecycle'
import type { FluidGlassStore } from './store'
import type { TransmissionShaderMode } from './transmission-material'

export {
  isNeutralTransmissionMaterial,
  resolveTransmissionDebugMode,
  resolveTransmissionSupportLayers,
} from './transmission-material'
export type { TransmissionShaderMode } from './transmission-material'

export const TransmissionShaderModeContext = createContext<TransmissionShaderMode>('custom')

export function FluidGlassTransmissionRenderer({
  debugView,
  environment,
  lens,
  lifecycle,
  onContextLost,
  onReady,
  lightDirection,
  material,
  materialPreset,
  onTelemetry,
  onFailure,
  quality,
  store,
}: {
  debugView: FluidGlassDebugView
  environment: FluidGlassEnvironmentSource
  lens: LensStateAdapter
  lifecycle: RendererLifecycleController
  onContextLost: () => void
  onReady: () => void
  lightDirection: readonly [number, number]
  material: FluidTransmissionMaterial
  materialPreset: FluidGlassMaterialPreset
  onFailure: () => void
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
  quality: FluidGlassQuality
  store: FluidGlassStore
}) {
  const shaderMode = useContext(TransmissionShaderModeContext)
  const resolvedQuality = resolveFluidGlassQuality(quality)
  const dpr = Math.min(1.5, resolvedQuality.dpr)
  const sceneReady = useRef(false)
  const handleSceneReady = useCallback(() => {
    if (sceneReady.current) return
    sceneReady.current = true
    lifecycle.transition('ready', 'transmission scene rendered')
    onReady()
  }, [lifecycle, onReady])

  useEffect(() => {
    sceneReady.current = false
    lifecycle.transition('creating', 'transmission renderer mounted')
    return () => lifecycle.dispose('transmission renderer unmounted')
  }, [lifecycle])

  return (
    <div
      aria-hidden
      data-fluid-glass-canvas
      data-fluid-glass-transmission
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
    >
      <RendererErrorBoundary onFailure={onFailure}>
        <Canvas
          orthographic
          frameloop="demand"
          camera={{ far: 220, near: 0.1, position: [0, 0, 100], zoom: 1 }}
          dpr={dpr}
          gl={{
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: Boolean(onTelemetry),
          }}
          onCreated={({ gl, invalidate }) => {
            gl.outputColorSpace = LinearSRGBColorSpace
            gl.toneMapping = NoToneMapping
            gl.setClearColor('#000000', 0)
            const canvas = gl.domElement
            canvas.style.pointerEvents = 'none'
            const handleRestored = () => {
              invalidate()
              lifecycle.transition('recovering', 'webgl context restoring')
            }
            const handleLost = (event: Event) => {
              event.preventDefault()
              sceneReady.current = false
              lifecycle.transition('context-lost', 'webglcontextlost')
              onContextLost()
            }
            canvas.addEventListener('webglcontextrestored', handleRestored)
            canvas.addEventListener('webglcontextlost', handleLost)
            lifecycle.register('listener', () => {
              canvas.removeEventListener('webglcontextrestored', handleRestored)
              canvas.removeEventListener('webglcontextlost', handleLost)
            })
            lifecycle.register('resource', () => gl.dispose())
          }}
          fallback={null}
        >
          <TransmissionScene
            debugView={debugView}
            environment={environment}
            lens={lens}
            onFailure={onFailure}
            onReady={handleSceneReady}
            lightDirection={lightDirection}
            material={material}
            materialPreset={materialPreset}
            onTelemetry={onTelemetry}
            quality={quality}
            shaderMode={shaderMode}
            store={store}
          />
        </Canvas>
      </RendererErrorBoundary>
    </div>
  )
}
