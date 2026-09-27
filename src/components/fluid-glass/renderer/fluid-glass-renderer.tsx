import { Canvas } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { resolveFluidGlassQuality } from '../constants'
import { FluidGlassScene } from './fluid-glass-scene'
import { RendererErrorBoundary } from './renderer-error-boundary'
import type { LensStateAdapter } from '../lens/lens-state'
import type { RendererLifecycleController } from '../lens/renderer-lifecycle'
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
  lens,
  lifecycle,
  lightDirection,
  material,
  onContextLost,
  onFailure,
  onReady,
  onTelemetry,
  quality,
  store,
}: {
  debugView: FluidGlassDebugView
  environment: FluidGlassEnvironmentSource

  lens: LensStateAdapter

  lifecycle: RendererLifecycleController
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  onContextLost: () => void
  onFailure: () => void
  onReady: () => void
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
  quality: FluidGlassQuality
  store: FluidGlassStore
}) {
  const resolvedQuality = resolveFluidGlassQuality(quality)
  const dpr = Math.min(1.5, resolvedQuality.dpr * resolvedQuality.framebufferScale)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    lifecycle.transition('creating', 'renderer mounted')
    return () => {
      lifecycle.dispose('renderer unmounted')
    }
  }, [lifecycle])

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
            preserveDrawingBuffer: Boolean(onTelemetry),
          }}
          onCreated={({ gl, invalidate }) => {
            const canvas = gl.domElement
            canvas.style.pointerEvents = 'none'
            canvasRef.current = canvas

            const handleRestored = () => {
              invalidate()

              lifecycle.transition('recovering', 'webgl context restoring')
              lifecycle.transition('ready', 'webgl context restored')
              onReady()
            }
            const handleLost = (event: Event) => {
              event.preventDefault()
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
            lifecycle.register('canvas', () => {
              canvasRef.current = null
            })

            lifecycle.transition('ready', 'webgl context created')
            onReady()
          }}
          fallback={null}
        >
          <FluidGlassScene
            debugView={debugView}
            environment={environment}
            lens={lens}
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
