import { Canvas } from '@react-three/fiber'

import { resolveFluidGlassQuality } from '../constants'
import { FluidGlassScene } from './fluid-glass-scene'
import { RendererErrorBoundary } from './renderer-error-boundary'
import type {
  FluidGlassDebugView,
  FluidGlassEnvironmentSource,
  FluidGlassMaterial,
  FluidGlassQuality,
  FluidGlassTelemetry,
} from '../types'
import type { FluidGlassStore } from './store'

export function FluidGlassRenderer({
  debugView,
  environment,
  lightDirection,
  material,
  onFailure,
  onTelemetry,
  quality,
  store,
}: {
  debugView: FluidGlassDebugView
  environment: FluidGlassEnvironmentSource
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  onFailure: () => void
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
  quality: FluidGlassQuality
  store: FluidGlassStore
}) {
  const resolvedQuality = resolveFluidGlassQuality(quality)
  const dpr = Math.min(1.5, resolvedQuality.dpr * resolvedQuality.framebufferScale)

  return (
    <div
      aria-hidden
      data-fluid-glass-canvas
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
    >
      <RendererErrorBoundary onFailure={onFailure}>
        <Canvas
          frameloop="demand"
          dpr={dpr}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
          }}
          onCreated={({ gl, invalidate }) => {
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
          <FluidGlassScene
            debugView={debugView}
            environment={environment}
            lightDirection={lightDirection}
            material={material}
            onFailure={onFailure}
            onTelemetry={onTelemetry}
            quality={quality}
            store={store}
          />
        </Canvas>
      </RendererErrorBoundary>
    </div>
  )
}
