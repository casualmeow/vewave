import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SpikeApproximationLens } from '../spike-surfaces'
import {
  cancelUncountedFrame,
  emptyFrameSample,
  instrumentationSnapshot,
  sampleFrames,
  scheduleUncountedFrame,
  waitFrames,
} from '../spike-runtime'

import { createControlledTextureUrl } from '../../components/fluid-glass-calibration'
import {
  findDomLensElement,
  findGroupElement,
  OutcomeLabel,
  rectOf,
  spikeTargets,
  summariseDeltas,
  useActiveTargetDriver,
  useLatestRef,
} from './shared'
import type { SpikeScenarioProps } from '../types'
import type { FluidGlassBackend, FluidGlassTelemetry } from '@/components/fluid-glass'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'

const lensSize = { width: 240, height: 96 }

export function ControlledImageScenario({
  variant,
  mode,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const textureUrl = useMemo(() => createControlledTextureUrl('light'), [])
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const telemetryCount = useRef(0)
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)
  const activeIndex = useActiveTargetDriver(mode === 'measure' && variant !== 'solid')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(8)
      if (cancelled) return
      readyRef.current()
      const frames = mode === 'measure' ? await sampleFrames(90) : emptyFrameSample
      if (cancelled) return

      const expected =
        variant === 'sdf' ? 'sdf' : variant === 'transmission' ? 'transmission' : 'css'
      if (backend !== expected) {
        statusRef.current('degraded')
        noteRef.current(`Requested ${variant} but the group resolved backend=${backend}.`)
      }

      publishRef.current({
        ...frames,
        resolvedBackend: backend,
        requestedVariant: variant,
        telemetryFrames: telemetryCount.current,
        controlledSourceKind: 'canvas-data-url image',
        ...instrumentationSnapshot(),
      })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [backend, mode, variant])

  if (variant === 'css-approximation' || variant === 'solid') {
    return (
      <div className="grid gap-3">
        <OutcomeLabel label={`variant: ${variant}`} detail="no WebGL group mounted" />
        <div
          className="relative grid h-[320px] w-full place-items-center overflow-hidden rounded-xl border border-border/70 bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(textureUrl)})` }}
        >
          {variant === 'solid' ? (
            <div
              aria-hidden
              style={{ ...lensSize, borderRadius: 18 }}
              className="border border-border bg-popover"
            />
          ) : (
            <SpikeApproximationLens
              size={lensSize}
              radius={18}
              strength="medium"
              frozen={mode === 'capture'}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <OutcomeLabel label={`variant: ${variant}`} detail={`resolved backend: ${backend}`} />
      <FluidGlassGroup
        activation="always"
        environment={{ type: 'image', src: textureUrl }}
        quality="auto"
        materialPreset="expressive"
        renderer={variant === 'transmission' ? 'transmission-experimental' : 'auto'}
        simulateReducedMotion={mode === 'capture'}
        onBackendChange={setBackend}
        onTelemetry={(telemetry: FluidGlassTelemetry) => {
          telemetryCount.current += 1
          void telemetry
        }}
        className="h-[320px] w-full rounded-xl"
        contentClassName="flex h-full items-center justify-center gap-3"
      >
        {spikeTargets.map((id, index) => (
          <FluidGlassTarget
            key={id}
            id={id}
            scopeId="spike"
            active={index === (mode === 'capture' ? 1 : activeIndex)}
            shape="rounded-rect"
            radius={18}
            asChild
          >
            <button type="button" className="rounded-[18px] px-6 py-5 text-sm font-medium">
              {id}
            </button>
          </FluidGlassTarget>
        ))}
      </FluidGlassGroup>
    </div>
  )
}

export function TransformedTargetScenario({
  variant,
  mode,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const telemetryLens = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)
  const coupled = variant.startsWith('coupled')
  const useTelemetryChannel = variant === 'coupled-sdf'

  useEffect(() => {
    let cancelled = false
    let frame = 0
    const samples: Array<{ dx: number; dy: number; dw: number; dh: number }> = []

    const run = async () => {
      await waitFrames(8)
      if (cancelled) return
      readyRef.current()

      if (mode === 'capture') {
        publishRef.current({
          geometryChannel: useTelemetryChannel
            ? 'onTelemetry (throttled ~80ms)'
            : 'dom-lens-element',
          resolvedBackend: backend,
          targetTransformed: coupled,
          samples: 0,
          captureOnly: true,
          ...instrumentationSnapshot(),
        })
        completeRef.current()
        return
      }

      const groupRect = findGroupElement(groupRef.current)?.getBoundingClientRect()
      const started = performance.now()

      const step = () => {
        const targetRect = rectOf(targetRef.current)
        const domLens = rectOf(findDomLensElement(groupRef.current))
        const lens = useTelemetryChannel
          ? telemetryLens.current && groupRect
            ? {
                x: telemetryLens.current.x + groupRect.left,
                y: telemetryLens.current.y + groupRect.top,
                width: telemetryLens.current.width,
                height: telemetryLens.current.height,
              }
            : null
          : domLens

        if (targetRect && lens) {
          samples.push({
            dx: lens.x - targetRect.x,
            dy: lens.y - targetRect.y,
            dw: lens.width - targetRect.width,
            dh: lens.height - targetRect.height,
          })
        }

        if (performance.now() - started < 2200) {
          frame = scheduleUncountedFrame(step)
          return
        }

        const summary = summariseDeltas(samples)
        if (samples.length === 0) {
          statusRef.current('unavailable')
          noteRef.current(
            'No observable lens geometry. The DOM lens exists only for the css backend, and the telemetry channel published nothing. Observing a WebGL lens per-frame would need a production debug seam.',
          )
        } else if (useTelemetryChannel) {
          statusRef.current('degraded')
          noteRef.current(
            'SDF lens geometry read through onTelemetry, which the scene throttles to ~80ms. Per-frame comparison is not possible without a production seam.',
          )
        }

        publishRef.current({
          ...summary,
          geometryChannel: useTelemetryChannel
            ? 'onTelemetry (throttled ~80ms)'
            : 'dom-lens-element',
          resolvedBackend: backend,
          targetTransformed: coupled,
          ...instrumentationSnapshot(),
        })
        completeRef.current()
      }

      frame = scheduleUncountedFrame(step)
    }

    void run()
    return () => {
      cancelled = true
      if (frame) cancelUncountedFrame(frame)
    }
  }, [backend, coupled, mode, useTelemetryChannel, variant])

  const motionProps = coupled
    ? {
        animate:
          mode === 'capture'
            ? { x: 24, y: 6, scale: 1.06, rotate: 0 }
            : { x: [0, 48, 0], y: [0, 12, 0], scale: [1, 1.12, 1], rotate: [0, 2.5, 0] },
        transition:
          mode === 'capture'
            ? { duration: 0 }
            : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {}

  return (
    <div className="grid gap-3">
      <OutcomeLabel
        label={`variant: ${variant}`}
        detail={`backend: ${backend} · lens channel: ${useTelemetryChannel ? 'telemetry' : 'dom'}`}
      />
      <div ref={groupRef}>
        <FluidGlassGroup
          activation="always"
          environment={{ type: 'theme', pattern: 'calm' }}
          quality="auto"
          forceFallback={!useTelemetryChannel}
          simulateReducedMotion={mode === 'capture'}
          onBackendChange={setBackend}
          onTelemetry={(telemetry: FluidGlassTelemetry) => {
            telemetryLens.current = {
              x: telemetry.targetDomX,
              y: telemetry.targetDomY,
              width: telemetry.targetCssWidth,
              height: telemetry.targetCssHeight,
            }
          }}
          className="h-[260px] w-full rounded-xl"
          contentClassName="flex h-full items-center justify-center"
        >
          <FluidGlassTarget
            id="moving"
            scopeId="spike"
            active
            shape="rounded-rect"
            radius={18}
            asChild
          >
            <motion.div
              ref={targetRef}
              {...motionProps}
              className="grid h-[96px] w-[240px] place-items-center rounded-[18px] text-sm font-medium"
            >
              {coupled ? 'coupled target' : 'stationary target'}
            </motion.div>
          </FluidGlassTarget>
        </FluidGlassGroup>
      </div>
    </div>
  )
}

export function ScrollAndPortalScenario({
  variant,
  mode,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const groupHostRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)

  useEffect(() => {
    if (variant !== 'portal') return
    const host = document.createElement('div')
    host.setAttribute('data-lens-spike-portal-host', '')
    document.body.append(host)
    setPortalHost(host)
    return () => host.remove()
  }, [variant])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(8)
      if (cancelled) return
      readyRef.current()

      const measure = () => {
        const lens = rectOf(findDomLensElement(groupHostRef.current))
        const target = rectOf(targetRef.current)
        if (!lens || !target) return null
        return { dx: lens.x - target.x, dy: lens.y - target.y }
      }

      const before = measure()
      const scroller = scrollRef.current
      if (scroller && variant !== 'portal') {
        if (variant === 'horizontal-scroll') scroller.scrollLeft = 160
        else scroller.scrollTop = 160
      }
      await waitFrames(6)
      if (cancelled) return
      const after = measure()

      if (!before || !after) {
        statusRef.current('unavailable')
        noteRef.current(
          'Lens or target geometry not observable in this configuration; the css-backend DOM lens is the only non-invasive channel.',
        )
      }

      publishRef.current({
        resolvedBackend: backend,
        deltaBeforeScrollX: before ? Number(before.dx.toFixed(3)) : null,
        deltaBeforeScrollY: before ? Number(before.dy.toFixed(3)) : null,
        deltaAfterScrollX: after ? Number(after.dx.toFixed(3)) : null,
        deltaAfterScrollY: after ? Number(after.dy.toFixed(3)) : null,
        scrollDriftX: before && after ? Number((after.dx - before.dx).toFixed(3)) : null,
        scrollDriftY: before && after ? Number((after.dy - before.dy).toFixed(3)) : null,
        container: variant,
        ...instrumentationSnapshot(),
      })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [backend, mode, variant, portalHost])

  const group = (
    <div ref={groupHostRef}>
      <FluidGlassGroup
        activation="always"
        environment={{ type: 'theme', pattern: 'calm' }}
        forceFallback
        simulateReducedMotion={mode === 'capture'}
        onBackendChange={setBackend}
        className="h-[220px] w-[420px] rounded-xl"
        contentClassName="flex h-full items-center justify-center"
      >
        <FluidGlassTarget
          id="scoped"
          scopeId="spike"
          active
          shape="rounded-rect"
          radius={18}
          asChild
        >
          <div
            ref={(element) => {
              targetRef.current = element
            }}
            className="grid h-[88px] w-[220px] place-items-center rounded-[18px] text-sm"
          >
            scoped target
          </div>
        </FluidGlassTarget>
      </FluidGlassGroup>
    </div>
  )

  if (variant === 'portal') {
    return (
      <div className="grid gap-3">
        <OutcomeLabel label="variant: portal" detail={`backend: ${backend}`} />
        {portalHost ? createPortal(group, portalHost) : null}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <OutcomeLabel label={`variant: ${variant}`} detail={`backend: ${backend}`} />
      <div
        ref={scrollRef}
        className={
          variant === 'horizontal-scroll'
            ? 'h-[260px] w-full overflow-x-auto overflow-y-hidden rounded-xl border border-border/70'
            : 'h-[260px] w-full overflow-y-auto overflow-x-hidden rounded-xl border border-border/70'
        }
      >
        <div
          className={
            variant === 'horizontal-scroll'
              ? 'flex w-[1400px] items-center gap-6 p-6'
              : 'grid gap-6 p-6'
          }
        >
          <div className="h-[120px] w-[380px] shrink-0 rounded-lg bg-muted" />
          {group}
          <div className="h-[120px] w-[380px] shrink-0 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
