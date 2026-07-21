import { Canvas } from '@react-three/fiber'
import { createContext, useContext } from 'react'
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
import type { FluidGlassStore } from './store'
import type { TransmissionShaderMode } from './transmission-material'

export {
  isNeutralTransmissionMaterial,
  resolveTransmissionDebugMode,
  resolveTransmissionSupportLayers,
} from './transmission-material'
export type { TransmissionShaderMode } from './transmission-material'

/**
 * Lab-only override for the material-lab comparison: 'stock' renders the
 * untouched drei MeshTransmissionMaterial (no onBeforeCompile patch).
 * Consumed here, outside the Canvas, because React context does not cross
 * the react-three-fiber renderer boundary; forwarded into the scene as a prop.
 */
export const TransmissionShaderModeContext = createContext<TransmissionShaderMode>('custom')

export function FluidGlassTransmissionRenderer({
  debugView,
  environment,
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
            preserveDrawingBuffer: true,
          }}
          onCreated={({ gl, invalidate }) => {
            gl.outputColorSpace = LinearSRGBColorSpace
            gl.toneMapping = NoToneMapping
            gl.setClearColor('#000000', 0)
            const canvas = gl.domElement
            canvas.style.pointerEvents = 'none'
            let restored = false
            canvas.addEventListener('webglcontextrestored', () => {
              restored = true
              invalidate()
            })
            canvas.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              restored = false
              window.setTimeout(() => {
                if (canvas.isConnected && !restored && gl.getContext().isContextLost()) onFailure()
              }, 1_200)
            })
          }}
          fallback={null}
        >
          <TransmissionScene
            debugView={debugView}
            environment={environment}
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
