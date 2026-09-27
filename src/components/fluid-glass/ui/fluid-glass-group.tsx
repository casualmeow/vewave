import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { resolveFluidGlassMaterial, resolveFluidTransmissionMaterial } from '../constants'
import { FluidGlassContext } from '../context/fluid-glass-context'
import { resolveFluidGlassBackendResolution } from '../renderer/backend'
import { FluidGlassDomRenderer } from '../renderer/dom-lens-renderer'
import { RendererErrorBoundary } from '../renderer/renderer-error-boundary'
import { useLensAppearance } from '../hooks/use-lens-appearance'
import { useBackdropReadability } from '../hooks/use-backdrop-readability'
import { FluidGlassStore } from '../renderer/store'
import { ACTIVE_LENS_GEOMETRY_POLICY } from '../lens/geometry-policy'
import { ContextRecoveryController } from '../lens/context-recovery'
import { LensDebugChannel } from '../lens/telemetry-contract'
import { LensPaneDebugContext, type LensPaneDebugSnapshot } from '../lens/pane-debug'
import {
  RendererLifecycleController,
  type LensRendererLifecycleState,
} from '../lens/renderer-lifecycle'
import { createLensStateAdapter } from '../lens/lens-state'
import { isWebglBackend, toLegacyBackend } from '../lens/backend-resolution'
import { useLensScopeGuard } from '../lens/scope-context'
import { lensWebGlScopeGuard } from '../lens/webgl-scope-guard'
import { probeWebglSupport } from '../lens/capability'
import type { LensScopeDenialReason } from '../lens/webgl-scope-guard'
import type { FluidGlassGroupProps, FluidGlassInteractionDiagnostics } from '../types'
import { cn } from '@/shared/lib/utils'
import { resolveGlassMotion } from '@/shared/theme/glass-motion'

const defaultLightDirection = [-0.72, 0.68] as const

const recoveryReadinessTimeoutMs = 4_000

const FluidGlassRenderer = lazy(() =>
  import('../renderer/fluid-glass-renderer').then((module) => ({
    default: module.FluidGlassRenderer,
  })),
)
const FluidGlassTransmissionRenderer = lazy(() =>
  import('../renderer/fluid-glass-transmission-renderer').then((module) => ({
    default: module.FluidGlassTransmissionRenderer,
  })),
)

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
  motion = 'auto',
  onBackendChange,
  onInteractionDiagnostics,
  onTelemetry,
  quality = 'auto',
  renderer = 'auto',
  simulateReducedMotion = false,
  transmissionMaterial: transmissionMaterialOverrides,
}: FluidGlassGroupProps) {
  const appearance = useLensAppearance()
  const [domRefractionFailed, setDomRefractionFailed] = useState(false)
  const handleDomUnavailable = useCallback(() => setDomRefractionFailed(true), [])
  const scopeId = useId()

  const scopeGuard = useLensScopeGuard()
  const recovery = useMemo(() => new ContextRecoveryController(), [])
  const debugChannel = useMemo(() => new LensDebugChannel(), [])
  const [recoverySnapshot, setRecoverySnapshot] = useState(() => recovery.snapshot)
  const [rendererGeneration, setRendererGeneration] = useState(0)
  const [scopeOwned, setScopeOwned] = useState(false)
  const [scopeDenialReason, setScopeDenialReason] = useState<LensScopeDenialReason | null>(null)
  const [scopeAvailable, setScopeAvailable] = useState(() => scopeGuard.canAcquire(scopeId))
  const interactionDiagnosticsRef = useRef<FluidGlassInteractionDiagnostics>({
    pointerOverCount: 0,
    pointerOutCount: 0,
    pointerMoveCount: 0,
    lastPointerTargetId: null,
  })

  const recoveryTimersRef = useRef(new Set<number>())
  const trackRecoveryTimer = useCallback((timer: number) => {
    recoveryTimersRef.current.add(timer)
    return () => {
      recoveryTimersRef.current.delete(timer)
      window.clearTimeout(timer)
    }
  }, [])

  const store = useMemo(() => new FluidGlassStore(), [])

  const lensAdapter = useMemo(
    () => createLensStateAdapter(store, ACTIVE_LENS_GEOMETRY_POLICY),
    [store],
  )
  const material = useMemo(
    () => resolveFluidGlassMaterial(materialPreset, materialOverrides),
    [materialOverrides, materialPreset],
  )
  const transmissionMaterial = useMemo(
    () => resolveFluidTransmissionMaterial(materialPreset, transmissionMaterialOverrides),
    [materialPreset, transmissionMaterialOverrides],
  )

  const sourceReadability = useBackdropReadability(environment)

  const reducedMotion = appearance.reducedMotion || simulateReducedMotion
  const motionProfile = resolveGlassMotion({
    ...appearance,
    preference: appearance.glassMotion,
    requested: motion,
    reducedMotion,
  })
  const transmissionPreferred = renderer === 'transmission-experimental'

  const rendererHealthy =
    recoverySnapshot.phase === 'healthy' || recoverySnapshot.phase === 'recovering'
  const resolution = resolveFluidGlassBackendResolution({
    activation,
    environment,
    experimentalRefraction: appearance.experimentalRefraction,
    forceFallback:
      forceFallback ||
      appearance.forceFallback ||
      (environment.type === 'auto-dom' && domRefractionFailed),
    quality,
    reducedTransparency: appearance.reducedTransparency,
    rendererHealthy,
    sourceReadability,
    surfaceStyle: appearance.surfaceStyle,
    transmissionPreferred,
    webgl2:
      environment.type !== 'auto-dom' &&
      quality !== 'disabled' &&
      !forceFallback &&
      !appearance.reducedTransparency &&
      (activation === 'always' ||
        (appearance.surfaceStyle === 'glass' && appearance.experimentalRefraction)) &&
      probeWebglSupport(),
    webglScopeAvailable: scopeOwned || scopeAvailable,
  })
  const backend = toLegacyBackend(resolution.backend)
  const wantsWebgl = isWebglBackend(resolution.backend)

  const [rendererSession, setRendererSession] = useState(0)
  const lifecycle = useMemo(() => {
    void rendererGeneration
    void rendererSession
    return new RendererLifecycleController()
  }, [rendererGeneration, rendererSession])

  const lifecycleId = `${rendererGeneration}:${rendererSession}`
  const [lifecycleState, setLifecycleState] = useState<LensRendererLifecycleState>(
    () => lifecycle.state,
  )

  const handleRendererFailure = useCallback(() => {
    const phase = recovery.snapshot.phase
    const next =
      phase === 'lost' || phase === 'recovering'
        ? recovery.notifyRecoveryFailed()
        : recovery.notifyContextLost('renderer-error')
    debugChannel.record('recovery-attempt', `renderer error handled as ${next.phase}`, scopeId)
    setRecoverySnapshot(next)
  }, [debugChannel, recovery, scopeId])

  const handleContextLost = useCallback(() => {
    debugChannel.record('context-lost', 'webgl context lost', scopeId)
    setRecoverySnapshot(recovery.notifyContextLost())
  }, [debugChannel, recovery, scopeId])

  const handleRendererReady = useCallback(() => {
    debugChannel.record('context-restored', 'renderer reported readiness', scopeId)
    setRecoverySnapshot(recovery.notifyRestored())
  }, [debugChannel, recovery, scopeId])

  useLayoutEffect(() => {
    store.motion.setMotionProfile(motionProfile)
    store.setReducedMotion(reducedMotion)
  }, [motionProfile, reducedMotion, store])

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
    store.scheduleMeasurement()
  }, [resolution.backend, store])

  useEffect(() => {
    onBackendChange?.(backend)
  }, [backend, onBackendChange])

  useEffect(() => {
    const timers = recoveryTimersRef.current
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      store.destroy()
      recovery.dispose()
      debugChannel.destroy()
    }
  }, [debugChannel, recovery, store])

  const wasWebglRef = useRef(wantsWebgl)
  useEffect(() => {
    const previous = wasWebglRef.current
    wasWebglRef.current = wantsWebgl
    if (wantsWebgl && !previous && lifecycle.disposed) {
      setRendererSession((session) => session + 1)
    }
  }, [lifecycle, wantsWebgl])

  useEffect(() => {
    setLifecycleState(lifecycle.state)
    return lifecycle.subscribe((state, reason) => {
      setLifecycleState(state)
      debugChannel.record('lifecycle-transition', `${state}: ${reason}`, scopeId)
    })
  }, [debugChannel, lifecycle, scopeId])

  useEffect(() => {
    if (!wantsWebgl) return
    const acquisition = scopeGuard.acquire(scopeId)
    if (!acquisition.granted) {
      debugChannel.record(
        'scope-denied',
        `slot held by ${acquisition.ownerId ?? 'unknown'}`,
        scopeId,
      )
      setScopeDenialReason(acquisition.reason as LensScopeDenialReason)
      setScopeAvailable(false)
      return
    }
    debugChannel.record('scope-acquired', 'webgl slot acquired', scopeId)
    setScopeDenialReason(null)
    setScopeOwned(true)

    let released = false
    const release = () => {
      if (released) return
      released = true
      scopeGuard.release(scopeId)
      debugChannel.record('scope-released', 'webgl slot released', scopeId)
      setScopeOwned(false)
    }

    if (!lifecycle.disposed) lifecycle.register('scope', release)
    return release
  }, [debugChannel, lifecycle, scopeGuard, scopeId, wantsWebgl])

  useEffect(() => {
    setScopeAvailable(scopeGuard.canAcquire(scopeId))
    return scopeGuard.subscribe(() => {
      setScopeAvailable(scopeGuard.canAcquire(scopeId))
    })
  }, [scopeGuard, scopeId])

  useEffect(() => {
    if (recoverySnapshot.phase !== 'lost') return
    if (!recovery.canAttemptRecovery) {
      lifecycle.transition('terminal-fallback', 'recovery budget exhausted')
      setRecoverySnapshot(recovery.notifyTerminal('attempts-exhausted'))
      return
    }
    return trackRecoveryTimer(
      window.setTimeout(() => {
        const next = recovery.beginRecovery()
        debugChannel.record(
          'recovery-attempt',
          `attempt ${next.attempts}/${next.maxAttempts}`,
          scopeId,
        )
        setRecoverySnapshot(next)
        lifecycle.transition('recovering', `recovery attempt ${next.attempts}`)

        setRendererGeneration((generation) => generation + 1)
      }, 0),
    )
  }, [debugChannel, lifecycle, recovery, recoverySnapshot.phase, scopeId, trackRecoveryTimer])

  useEffect(() => {
    if (recoverySnapshot.phase !== 'recovering') return
    return trackRecoveryTimer(
      window.setTimeout(() => {
        debugChannel.record('recovery-attempt', 'readiness timeout', scopeId)
        const next = recovery.notifyRecoveryFailed()
        if (next.phase === 'terminal') {
          lifecycle.transition('terminal-fallback', 'recovery readiness timeout')
        }
        setRecoverySnapshot(next)
      }, recoveryReadinessTimeoutMs),
    )
  }, [debugChannel, lifecycle, recovery, recoverySnapshot.phase, scopeId, trackRecoveryTimer])

  useEffect(() => {
    if (recoverySnapshot.phase !== 'terminal') return
    debugChannel.record(
      'recovery-terminal',
      `terminal fallback: ${recoverySnapshot.reason}`,
      scopeId,
    )
  }, [debugChannel, recoverySnapshot.phase, recoverySnapshot.reason, scopeId])

  useEffect(() => {
    debugChannel.record('backend-resolved', `${resolution.backend}: ${resolution.reason}`, scopeId)
  }, [debugChannel, resolution.backend, resolution.reason, scopeId])

  useEffect(() => {
    debugChannel.record(
      'source-readability-changed',
      `${resolution.sourceCategory}: ${sourceReadability}`,
      scopeId,
    )
  }, [debugChannel, resolution.sourceCategory, scopeId, sourceReadability])

  const groupElementRef = useRef<HTMLDivElement | null>(null)
  const setGroupRef = useCallback(
    (element: HTMLDivElement | null) => {
      groupElementRef.current = element
      store.setGroup(element)
    },
    [store],
  )

  useEffect(() => {
    let frame = 0
    let stableFrames = 0
    let signature = ''
    const deadline = performance.now() + 1_200

    const tick = () => {
      const element = groupElementRef.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const next = `${rect.x.toFixed(2)}:${rect.y.toFixed(2)}:${rect.width.toFixed(2)}:${rect.height.toFixed(2)}`
      if (next !== signature) {
        signature = next
        stableFrames = 0
        store.scheduleMeasurement()
      } else {
        stableFrames += 1
      }
      if (stableFrames < 3 && performance.now() < deadline) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [store])
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

  const paneDebug: LensPaneDebugSnapshot = useMemo(
    () => ({
      requestedRenderer: renderer,
      resolvedBackend: resolution.backend,
      legacyBackend: backend,
      reason: resolution.reason,
      degraded: resolution.degraded,
      accessibilityEnforced: resolution.accessibilityEnforced,
      sourceCategory: resolution.sourceCategory,
      sourceReadability,
      scopeId,
      ownsScope: scopeOwned,
      scopeDenialReason,
      scopeOwnerId: scopeGuard.ownerId,
      ownershipClass: scopeGuard.ownershipClass,
      lifecycleState,
      recoveryPhase: recoverySnapshot.phase,
    }),
    [
      backend,
      lifecycleState,
      recoverySnapshot.phase,
      renderer,
      resolution.accessibilityEnforced,
      resolution.backend,
      resolution.degraded,
      resolution.reason,
      resolution.sourceCategory,
      scopeDenialReason,
      scopeGuard,
      scopeId,
      scopeOwned,
      sourceReadability,
    ],
  )

  const domRenderer = (
    <FluidGlassDomRenderer
      lens={lensAdapter}
      backend={wantsWebgl ? 'css-approximation' : resolution.backend}
      reason={resolution.reason}
      material={material}
      environment={environment}
      lightDirection={lightDirection}
      onUnavailable={handleDomUnavailable}
    />
  )

  return (
    <FluidGlassContext.Provider value={store}>
      <LensPaneDebugContext.Provider value={paneDebug}>
        <div
          ref={setGroupRef}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onPointerOver={handlePointerOver}
          data-fluid-glass-group={mode}
          data-fluid-glass-requested-renderer={renderer}
          data-fluid-glass-backend={backend}
          data-fluid-glass-resolved-backend={resolution.backend}
          data-fluid-glass-reason={resolution.reason}
          data-fluid-glass-degraded={resolution.degraded || undefined}
          data-fluid-glass-accessibility-enforced={resolution.accessibilityEnforced || undefined}
          data-fluid-glass-source={resolution.sourceCategory}
          data-fluid-glass-readability={sourceReadability}
          data-fluid-glass-geometry-policy={ACTIVE_LENS_GEOMETRY_POLICY}
          data-fluid-glass-lifecycle={lifecycleState}
          data-fluid-glass-recovery={recoverySnapshot.phase}
          data-fluid-glass-recovery-attempts={`${recoverySnapshot.attempts}/${recoverySnapshot.maxAttempts}`}
          data-fluid-glass-scope-owner={scopeOwned ? scopeId : undefined}
          data-fluid-glass-scope-denial={scopeDenialReason ?? undefined}
          data-fluid-glass-scope-boundary={
            scopeGuard === lensWebGlScopeGuard ? 'production' : 'laboratory'
          }
          data-fluid-glass-tone={environment.type === 'theme' ? environment.tone : undefined}
          data-fluid-glass-debug={debugView === 'final' ? undefined : debugView}
          data-reduced-motion={reducedMotion || undefined}
          data-glass-motion={motionProfile}
          className={cn(
            'relative',

            environment.type === 'auto-dom' ? 'overflow-visible' : 'isolate overflow-hidden',
            className,
          )}
        >
          <RendererErrorBoundary
            key={`${lifecycleId}:${resolution.backend}`}
            onFailure={handleRendererFailure}
          >
            <Suspense fallback={domRenderer}>
              {resolution.backend === 'sdf' ? (
                <FluidGlassRenderer
                  key={lifecycleId}
                  debugView={debugView}
                  environment={environment}
                  lens={lensAdapter}
                  lifecycle={lifecycle}
                  lightDirection={lightDirection}
                  material={material}
                  quality={quality === 'disabled' ? 'low' : quality}
                  store={store}
                  onContextLost={handleContextLost}
                  onFailure={handleRendererFailure}
                  onReady={handleRendererReady}
                  onTelemetry={onTelemetry ? store.telemetry.publish : undefined}
                />
              ) : null}

              {resolution.backend === 'transmission-experimental' ? (
                <FluidGlassTransmissionRenderer
                  key={lifecycleId}
                  lens={lensAdapter}
                  lifecycle={lifecycle}
                  onReady={handleRendererReady}
                  onContextLost={handleContextLost}
                  debugView={debugView}
                  environment={environment}
                  lightDirection={lightDirection}
                  material={transmissionMaterial}
                  materialPreset={materialPreset}
                  quality={quality === 'disabled' ? 'low' : quality}
                  store={store}
                  onFailure={handleRendererFailure}
                  onTelemetry={onTelemetry ? store.telemetry.publish : undefined}
                />
              ) : null}

              {!wantsWebgl ? domRenderer : null}
            </Suspense>
          </RendererErrorBoundary>

          <div data-fluid-glass-content className={cn('relative z-10', contentClassName)}>
            {children}
          </div>
        </div>
      </LensPaneDebugContext.Provider>
    </FluidGlassContext.Provider>
  )
}
