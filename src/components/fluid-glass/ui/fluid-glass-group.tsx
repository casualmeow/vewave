import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { resolveFluidGlassMaterial, resolveFluidTransmissionMaterial } from '../constants'
import { FluidGlassContext } from '../context/fluid-glass-context'
import { resolveFluidGlassBackend, supportsWebGl2 } from '../renderer/backend'
import { FluidGlassRenderer } from '../renderer/fluid-glass-renderer'
import { FluidGlassTransmissionRenderer } from '../renderer/fluid-glass-transmission-renderer'
import { FluidGlassStore } from '../renderer/store'
import type { FluidGlassGroupProps, FluidGlassInteractionDiagnostics } from '../types'
import { GlassSurface } from '@/shared/ui/glass-surface'
import { cn } from '@/shared/lib/utils'

const defaultLightDirection = [-0.72, 0.68] as const

type AppearanceState = {
  experimentalRefraction: boolean
  reducedMotion: boolean
  reducedTransparency: boolean
  surfaceStyle: string
}

function readAppearanceState(): AppearanceState {
  if (typeof window === 'undefined') {
    return {
      experimentalRefraction: false,
      reducedMotion: false,
      reducedTransparency: false,
      surfaceStyle: 'solid',
    }
  }

  const root = document.documentElement
  return {
    experimentalRefraction: root.dataset.glassRefraction === 'on',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
    surfaceStyle: root.dataset.surfaceStyle ?? 'solid',
  }
}

export function FluidGlassGroup({
  activation = 'appearance',
  children,
  className,
  contentClassName,
  debugView = 'final',
  environment = { type: 'theme' },
  forceFallback = false,
  lightDirection = defaultLightDirection,
  material: materialOverrides,
  materialPreset = 'production',
  mode = 'shared-lens',
  onBackendChange,
  onInteractionDiagnostics,
  onTelemetry,
  quality = 'auto',
  renderer = 'auto',
  simulateReducedMotion = false,
  transmissionMaterial: transmissionMaterialOverrides,
}: FluidGlassGroupProps) {
  const [appearance, setAppearance] = useState(readAppearanceState)
  const [rendererFailed, setRendererFailed] = useState<'sdf' | 'transmission' | null>(null)
  const fallbackLensRef = useRef<HTMLDivElement>(null)
  const interactionDiagnosticsRef = useRef<FluidGlassInteractionDiagnostics>({
    pointerOverCount: 0,
    pointerOutCount: 0,
    pointerMoveCount: 0,
    lastPointerTargetId: null,
  })
  const store = useMemo(() => new FluidGlassStore(), [])
  const material = useMemo(
    () => resolveFluidGlassMaterial(materialPreset, materialOverrides),
    [materialOverrides, materialPreset],
  )
  const transmissionMaterial = useMemo(
    () => resolveFluidTransmissionMaterial(materialPreset, transmissionMaterialOverrides),
    [materialPreset, transmissionMaterialOverrides],
  )
  const reducedMotion = appearance.reducedMotion || simulateReducedMotion
  const transmissionPreferred =
    renderer === 'transmission-experimental' && rendererFailed !== 'transmission'
  const backend = resolveFluidGlassBackend({
    activation,
    environment,
    experimentalRefraction: appearance.experimentalRefraction,
    forceFallback: forceFallback || rendererFailed === 'sdf',
    quality,
    reducedTransparency: appearance.reducedTransparency,
    surfaceStyle: appearance.surfaceStyle,
    transmissionPreferred,
    webgl2: supportsWebGl2(),
  })
  const handleRendererFailure = useCallback(() => {
    if (backend === 'sdf' || backend === 'transmission') setRendererFailed(backend)
  }, [backend])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const transparencyMedia = window.matchMedia('(prefers-reduced-transparency: reduce)')
    const update = () => setAppearance(readAppearanceState())
    const observer = new MutationObserver(update)

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-glass-refraction', 'data-surface-style'],
    })
    motionMedia.addEventListener('change', update)
    transparencyMedia.addEventListener('change', update)

    return () => {
      observer.disconnect()
      motionMedia.removeEventListener('change', update)
      transparencyMedia.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    store.setReducedMotion(reducedMotion)
  }, [reducedMotion, store])

  useEffect(() => {
    store.setResolvedMaterials(material, transmissionMaterial)
  }, [material, store, transmissionMaterial])

  useEffect(() => {
    store.telemetry.setListener(onTelemetry)
    return () => store.telemetry.setListener(undefined)
  }, [onTelemetry, store])

  useEffect(() => {
    const invalidateGeometry = () => store.scheduleMeasurement()
    window.addEventListener('scroll', invalidateGeometry, true)
    window.addEventListener('resize', invalidateGeometry)
    return () => {
      window.removeEventListener('scroll', invalidateGeometry, true)
      window.removeEventListener('resize', invalidateGeometry)
    }
  }, [store])

  useEffect(() => {
    onBackendChange?.(backend)
  }, [backend, onBackendChange])

  useEffect(() => {
    if (backend !== 'css') return
    return store.subscribe(() => {
      const lens = fallbackLensRef.current
      if (!lens) return
      const state = store.current
      const width = state.width * state.scaleX
      const height = state.height * state.scaleY
      const offsetX = state.x - (width - state.width) / 2
      const offsetY = state.y - (height - state.height) / 2
      lens.style.width = `${width}px`
      lens.style.height = `${height}px`
      lens.style.borderRadius = `${state.radius}px`
      lens.style.opacity = `${state.opacity}`
      lens.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`
    })
  }, [backend, store])

  const setGroupRef = useCallback(
    (element: HTMLDivElement | null) => store.setGroup(element),
    [store],
  )
  const publishInteractionDiagnostics = useCallback(
    (
      counter: 'pointerOverCount' | 'pointerOutCount' | 'pointerMoveCount',
      target: EventTarget | null,
    ) => {
      if (!onInteractionDiagnostics) return
      const targetElement = target instanceof Element ? target : null
      const targetId = targetElement?.closest<HTMLElement>('[data-fluid-glass-target]')?.dataset
        .fluidGlassTarget
      const next = {
        ...interactionDiagnosticsRef.current,
        [counter]: interactionDiagnosticsRef.current[counter] + 1,
        lastPointerTargetId: targetId ?? null,
      }
      interactionDiagnosticsRef.current = next
      onInteractionDiagnostics(next)
    },
    [onInteractionDiagnostics],
  )
  const handlePointerOver = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      publishInteractionDiagnostics('pointerOverCount', event.target)
      store.handlePointerOver(event.nativeEvent.composedPath())
    },
    [publishInteractionDiagnostics, store],
  )
  const handlePointerOut = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      publishInteractionDiagnostics('pointerOutCount', event.target)
      store.handlePointerOut(event.nativeEvent.composedPath(), event.relatedTarget)
    },
    [publishInteractionDiagnostics, store],
  )
  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      publishInteractionDiagnostics('pointerMoveCount', event.target)
    },
    [publishInteractionDiagnostics],
  )

  return (
    <FluidGlassContext.Provider value={store}>
      <div
        ref={setGroupRef}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver}
        data-fluid-glass-group={mode}
        data-fluid-glass-backend={backend}
        data-fluid-glass-tone={environment.type === 'theme' ? environment.tone : undefined}
        data-fluid-glass-debug={debugView === 'final' ? undefined : debugView}
        data-reduced-motion={reducedMotion || undefined}
        className={cn('relative isolate overflow-hidden', className)}
      >
        {backend === 'sdf' ? (
          <FluidGlassRenderer
            debugView={debugView}
            environment={environment}
            lightDirection={lightDirection}
            material={material}
            quality={quality === 'disabled' ? 'low' : quality}
            store={store}
            onFailure={handleRendererFailure}
            onTelemetry={store.telemetry.publish}
          />
        ) : null}

        {backend === 'transmission' ? (
          <FluidGlassTransmissionRenderer
            debugView={debugView}
            environment={environment}
            lightDirection={lightDirection}
            material={transmissionMaterial}
            materialPreset={materialPreset}
            quality={quality === 'disabled' ? 'low' : quality}
            store={store}
            onFailure={handleRendererFailure}
            onTelemetry={store.telemetry.publish}
          />
        ) : null}

        {backend === 'css' ? (
          <>
            <div
              aria-hidden
              data-fluid-glass-environment={environment.type}
              data-pattern={environment.type === 'theme' ? environment.pattern : undefined}
              data-tone={environment.type === 'theme' ? environment.tone : undefined}
              className="fluid-glass-css-environment pointer-events-none absolute inset-0 z-0"
              style={
                environment.type === 'image'
                  ? { backgroundImage: `url(${JSON.stringify(environment.src)})` }
                  : undefined
              }
            />
            <GlassSurface
              ref={fallbackLensRef}
              aria-hidden
              role="control"
              surface="auto"
              thickness="thin"
              elevation="embedded"
              className="pointer-events-none absolute left-0 top-0 z-[1] border-[color:var(--glass-border)]"
            />
          </>
        ) : null}

        <div data-fluid-glass-content className={cn('relative z-10', contentClassName)}>
          {children}
        </div>
      </div>
    </FluidGlassContext.Provider>
  )
}
