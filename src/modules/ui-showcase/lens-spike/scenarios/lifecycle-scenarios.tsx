import { useCallback, useEffect, useRef, useState } from 'react'

import {
  emptyFrameSample,
  instrumentationSnapshot,
  readMemory,
  roundMetric,
  sampleFrames,
  waitFrames,
} from '../spike-runtime'
import { createControlledTextureUrl } from '../../components/fluid-glass-calibration'
import { OutcomeLabel, spikeTargets, useActiveTargetDriver, useLatestRef } from './shared'
import type { SpikeMetricValue, SpikeScenarioProps } from '../types'
import type { FluidGlassBackend } from '@/components/fluid-glass'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { supportsLiquidGlassRefraction } from '@/shared/lib/liquid-glass'

function SpikeGroup({
  environment,
  forceFallback = false,
  reduced,
  activeIndex,
  onBackendChange,
  className = 'h-[200px] w-full rounded-xl',
}: {
  environment: { type: 'theme'; pattern?: 'calm' | 'grid' } | { type: 'image'; src: string }
  forceFallback?: boolean
  reduced: boolean
  activeIndex: number
  onBackendChange?: (backend: FluidGlassBackend) => void
  className?: string
}) {
  return (
    <FluidGlassGroup
      activation="always"
      environment={environment}
      quality="auto"
      forceFallback={forceFallback}
      simulateReducedMotion={reduced}
      onBackendChange={onBackendChange}
      className={className}
      contentClassName="flex h-full items-center justify-center gap-2"
    >
      {spikeTargets.map((id, index) => (
        <FluidGlassTarget
          key={id}
          id={id}
          scopeId="spike"
          active={index === activeIndex}
          shape="rounded-rect"
          radius={16}
          asChild
        >
          <button type="button" className="rounded-[16px] px-5 py-4 text-xs font-medium">
            {id}
          </button>
        </FluidGlassTarget>
      ))}
    </FluidGlassGroup>
  )
}

const edgeDescriptions: Record<string, string> = {
  'webgl-creation-failure': 'getContext("webgl2") forced to return null before app JS ran',
  'image-load-failure': 'environment image points at a missing file',
  'source-readability-failure':
    'environment image served from a second origin (localhost vs 127.0.0.1)',
  'reduced-transparency': 'prefers-reduced-transparency forced to reduce',
  'advanced-effects-disabled': 'nearest analogue only — no such production setting exists',
  'native-displacement-unavailable': 'CSS.supports for backdrop-filter:url() forced false',
}

export function FallbackEdgesScenario({
  variant,
  mode,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)
  const config = typeof window === 'undefined' ? {} : (window.__lensSpikeConfig ?? {})

  const environment =
    variant === 'image-load-failure'
      ? ({ type: 'image', src: '/spike/definitely-missing.png' } as const)
      : variant === 'source-readability-failure'
        ? ({
            type: 'image',

            src: `http://localhost:3000/spike/field.png`,
          } as const)
        : ({ type: 'theme', pattern: 'calm' } as const)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(10)
      if (cancelled) return
      readyRef.current()

      await new Promise((resolve) => window.setTimeout(resolve, 900))
      if (cancelled) return

      const metrics: Record<string, SpikeMetricValue> = {
        resolvedBackend: backend,
        edge: variant,
        edgeMechanism: edgeDescriptions[variant] ?? 'unknown',
        nativeRefractionSupported: supportsLiquidGlassRefraction(),
      }

      if (variant === 'webgl-creation-failure') {
        if (!config.forceWebglFailure) {
          statusRef.current('unavailable')
          noteRef.current(
            'WebGL creation failure could not be forced: the spike init script was not installed. Run through `npm run spike:lens`.',
          )
        } else {
          metrics.forcedWebglFailure = true
        }
      }

      if (variant === 'reduced-transparency') {
        metrics.reducedTransparencyMechanism = 'scenario-control'
        noteRef.current(
          'prefers-reduced-transparency was overridden on the spike page via matchMedia. The engine media query itself was NOT exercised.',
        )
      }

      if (variant === 'source-readability-failure') {
        let taintObserved: SpikeMetricValue = null
        try {
          const image = new Image()
          image.crossOrigin = 'anonymous'
          await new Promise<void>((resolve) => {
            image.onload = () => resolve()
            image.onerror = () => resolve()
            image.src = `http://localhost:3000/spike/field.png`
          })
          const canvas = document.createElement('canvas')
          canvas.width = 4
          canvas.height = 4
          const context = canvas.getContext('2d')
          context?.drawImage(image, 0, 0, 4, 4)
          context?.getImageData(0, 0, 1, 1)
          taintObserved = false
        } catch {
          taintObserved = true
        }
        metrics.spikeCanvasTaintObserved = taintObserved
        statusRef.current('degraded')
        noteRef.current(
          'Production has no source-readability probe: FluidGlassGroup accepts only a URL and reacts to load errors. Distinguishing "loaded but tainted" would require a readability seam that does not exist in the baseline.',
        )
      }

      if (variant === 'advanced-effects-disabled') {
        statusRef.current('unavailable')
        noteRef.current(
          'No advanced-effects setting exists in the baseline. Rendered the nearest analogue (forceFallback) instead; the real seam would be a capability/settings API introduced in a later phase.',
        )
        metrics.nearestAnalogue = 'forceFallback prop'
      }

      if (variant === 'native-displacement-unavailable' && !config.forceNativeSvgUnavailable) {
        noteRef.current(
          'Native displacement was already unavailable in this engine; no override was needed.',
        )
      }

      publishRef.current({ ...metrics, ...instrumentationSnapshot() })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [backend, variant])

  return (
    <div className="grid gap-3">
      <OutcomeLabel
        label={`edge: ${variant}`}
        detail={`resolved backend: ${backend} — ${edgeDescriptions[variant] ?? ''}`}
      />
      <SpikeGroup
        environment={environment}
        forceFallback={variant === 'advanced-effects-disabled'}
        reduced={mode === 'capture'}
        activeIndex={1}
        onBackendChange={setBackend}
      />
    </div>
  )
}

export function TeardownScenario({
  variant,
  mode,
  amount,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const [mounted, setMounted] = useState(false)
  const [cycle, setCycle] = useState(0)
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)
  const cycles = Math.max(1, amount)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(4)
      if (cancelled) return
      readyRef.current()

      window.__lensSpike?.reset()
      const memoryBefore = readMemory()
      const startedAt = performance.now()

      let canvasObservedCycles = 0
      for (let index = 0; index < cycles; index += 1) {
        if (cancelled) return
        setCycle(index)
        setMounted(true)

        for (let attempt = 0; attempt < 20; attempt += 1) {
          await waitFrames(1)
          if (cancelled) return
          if (document.querySelector('[data-fluid-glass-canvas] canvas')) break
        }
        if (document.querySelector('[data-fluid-glass-canvas] canvas')) canvasObservedCycles += 1
        setMounted(false)
        await waitFrames(3)
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1200))
      if (cancelled) return

      const snapshot = instrumentationSnapshot()
      const rafPendingAfterSettle = snapshot.rafPending
      const canvasesRemaining = document.querySelectorAll('[data-fluid-glass-canvas] canvas').length

      if (typeof rafPendingAfterSettle === 'number' && rafPendingAfterSettle > 0) {
        statusRef.current('degraded')
        noteRef.current(
          `${rafPendingAfterSettle} rAF callback(s) still pending after the settling window.`,
        )
      }
      noteRef.current(
        'A removed canvas node and a released JS reference are NOT confirmation that the GPU context was disposed; no web API reports that. Treat these counts as DOM/JS-side observations only.',
      )
      if (memoryBefore === null) {
        noteRef.current('No memory API available in this engine; memory metrics are null.')
      }

      publishRef.current({
        ...snapshot,
        cyclesRequested: cycles,
        cyclesWithCanvasObserved: canvasObservedCycles,
        totalCycleDurationMs: roundMetric(performance.now() - startedAt),
        canvasesRemainingAfterUnmount: canvasesRemaining,
        rafPendingAfterSettle,
        usedJsHeapBytesBefore: memoryBefore,
        usedJsHeapBytesAfter: readMemory(),
        gpuDisposalConfirmed: false,
      })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [cycles, variant])

  return (
    <div className="grid gap-3">
      <OutcomeLabel label={`variant: ${variant}`} detail={`cycle ${cycle + 1} / ${cycles}`} />
      <div className="min-h-[200px]">
        {mounted ? (
          <SpikeGroup
            key={cycle}
            environment={{ type: 'theme', pattern: 'calm' }}
            forceFallback={variant === 'css'}
            reduced={mode === 'capture'}
            activeIndex={1}
          />
        ) : (
          <div className="grid h-[200px] place-items-center rounded-xl border border-dashed border-border/70 text-xs text-muted-foreground">
            unmounted
          </div>
        )}
      </div>
    </div>
  )
}

export function ContextLossScenario({
  variant,
  mode,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const backendRef = useRef<FluidGlassBackend>('css')
  backendRef.current = backend
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(10)
      if (cancelled) return
      readyRef.current()

      const canvas = document.querySelector<HTMLCanvasElement>('[data-fluid-glass-canvas] canvas')
      const context = canvas?.getContext('webgl2') ?? null
      const extension = context?.getExtension('WEBGL_lose_context') ?? null
      const backendBefore = backendRef.current

      if (!canvas || !extension) {
        statusRef.current('unavailable')
        noteRef.current(
          !canvas
            ? 'No WebGL canvas mounted — the group resolved to the css backend, so context loss cannot be exercised here.'
            : 'WEBGL_lose_context is not exposed by this engine; loss cannot be simulated without it.',
        )
        publishRef.current({
          extensionAvailable: Boolean(extension),
          canvasFound: Boolean(canvas),
          backendBefore,
          ...instrumentationSnapshot(),
        })
        completeRef.current()
        return
      }

      const beforeSnapshot = instrumentationSnapshot()
      extension.loseContext()

      await new Promise((resolve) => window.setTimeout(resolve, 1800))
      if (cancelled) return
      const backendAfterLoss = backendRef.current
      const lossSnapshot = instrumentationSnapshot()

      extension.restoreContext()
      await new Promise((resolve) => window.setTimeout(resolve, 1800))
      if (cancelled) return
      const backendAfterRestore = backendRef.current
      const restoreSnapshot = instrumentationSnapshot()

      const lossObserved =
        Number(lossSnapshot.webglContextLost ?? 0) > Number(beforeSnapshot.webglContextLost ?? 0)
      const restoreObserved =
        Number(restoreSnapshot.webglContextRestored ?? 0) >
        Number(lossSnapshot.webglContextRestored ?? 0)
      const readinessConfirmed = Boolean(document.querySelector('[data-fluid-glass-canvas] canvas'))

      const backendUnchangedAfterRestore =
        backendAfterRestore === backendBefore && backendBefore !== 'css'
      const rendererRecovered =
        lossObserved && restoreObserved && readinessConfirmed && backendUnchangedAfterRestore

      if (!lossObserved || !restoreObserved) {
        statusRef.current('unavailable')
        noteRef.current(
          `Context loss could not be witnessed (lossObserved=${lossObserved}, restoreObserved=${restoreObserved}). Without the instrumented counters installed by \`npm run spike:lens\` there is no evidence a loss ever occurred, so no recovery is claimed.`,
        )
      } else if (!rendererRecovered) {
        noteRef.current(
          `Renderer did not return to ${backendBefore} after restore (backend=${backendAfterRestore}). Recorded as the Phase 2 baseline; not repaired in this phase.`,
        )
        statusRef.current('degraded')
      }

      publishRef.current({
        extensionAvailable: true,
        canvasFound: true,
        backendBefore,
        backendAfterLoss,
        backendAfterRestore,
        lossObserved,
        fallbackObserved: backendAfterLoss !== backendBefore,
        restoreRequested: true,
        restoreObserved,
        readinessConfirmed,
        backendUnchangedAfterRestore,
        rendererRecovered,
        ...restoreSnapshot,
      })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [variant])

  return (
    <div className="grid gap-3">
      <OutcomeLabel label={`variant: ${variant}`} detail={`current backend: ${backend}`} />
      <SpikeGroup
        environment={{ type: 'theme', pattern: 'calm' }}
        reduced={mode === 'capture'}
        activeIndex={1}
        onBackendChange={setBackend}
      />
    </div>
  )
}

export function ScopeSweepScenario({
  variant,
  mode,
  amount,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const groupCount = Math.max(1, amount)
  const [backends, setBackends] = useState<Array<FluidGlassBackend>>([])
  const mountedAt = useRef(performance.now())
  const readyAt = useRef<number | null>(null)
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)
  const activeIndex = useActiveTargetDriver(mode === 'measure')

  const handleBackend = useCallback(
    (index: number) => (backend: FluidGlassBackend) => {
      setBackends((current) => {
        const next = [...current]
        next[index] = backend
        return next
      })
    },
    [],
  )

  const resolvedCount = backends.filter(Boolean).length
  if (resolvedCount >= groupCount && readyAt.current === null) {
    readyAt.current = performance.now()
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(12)
      if (cancelled) return
      readyRef.current()

      if (!instrumentationSnapshot().instrumentationReady) {
        publishRef.current({ previewRendered: true })
        return
      }

      const lossBaseline = Number(instrumentationSnapshot().webglContextLost ?? 0)
      const frames = mode === 'measure' ? await sampleFrames(120) : emptyFrameSample
      if (cancelled) return

      const snapshot = instrumentationSnapshot()
      const webglCreated = Number(snapshot.webglContextsCreated ?? 0)
      const liveCanvases = document.querySelectorAll('[data-fluid-glass-canvas] canvas').length
      const lossDuringWindow = Number(snapshot.webglContextLost ?? 0) - lossBaseline

      if (variant !== 'css' && webglCreated < groupCount) {
        statusRef.current('degraded')
        noteRef.current(
          `Requested ${groupCount} WebGL group(s) but only ${webglCreated} context(s) were created.`,
        )
      }
      if (lossDuringWindow > 0) {
        statusRef.current('degraded')
        noteRef.current(
          `${lossDuringWindow} context-loss event(s) observed while ${groupCount} group(s) were live.`,
        )
      }

      publishRef.current({
        ...frames,
        ...snapshot,
        groupsRequested: groupCount,
        webglContextLostDuringWindow: lossDuringWindow,
        webglContextLostBeforeWindow: lossBaseline,
        backendsResolved: backends.filter(Boolean).join(',') || 'none',
        coldMountToAllReadyMs:
          readyAt.current === null ? null : roundMetric(readyAt.current - mountedAt.current),
        liveCanvasCount: liveCanvases,
        frameDriver: mode === 'measure' ? 'active-target-cycle' : 'none',
        usedJsHeapBytes: readMemory(),
      })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [groupCount, mode, variant])

  return (
    <div className="grid gap-3">
      <OutcomeLabel
        label={`variant: ${variant}`}
        detail={`${groupCount} group(s) · backends: ${backends.filter(Boolean).join(', ') || '…'}`}
      />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: groupCount }, (_, index) => (
          <SpikeGroup
            key={index}
            environment={
              variant === 'sdf'
                ? { type: 'image', src: createControlledTextureUrl(index % 2 ? 'dark' : 'light') }
                : { type: 'theme', pattern: 'calm' }
            }
            forceFallback={variant === 'css'}
            reduced={mode === 'capture'}
            activeIndex={mode === 'capture' ? 1 : activeIndex}
            onBackendChange={handleBackend(index)}
            className="h-[180px] w-full rounded-xl"
          />
        ))}
      </div>
    </div>
  )
}
