import { useCallback, useEffect, useRef, useState } from 'react'

import { cancelUncountedFrame, scheduleUncountedFrame } from '../spike-runtime'
import type { SpikeMetricValue } from '../types'

export const spikeTargets = ['alpha', 'bravo', 'charlie'] as const

export function findDomLensElement(host: HTMLElement | null): HTMLElement | null {
  if (!host) return null
  return host.querySelector<HTMLElement>(
    '[data-fluid-glass-group] > [data-slot="glass-surface"][aria-hidden]',
  )
}

export function findGroupElement(host: HTMLElement | null): HTMLElement | null {
  return host?.querySelector<HTMLElement>('[data-fluid-glass-group]') ?? null
}

export function rectOf(element: Element | null) {
  if (!element) return null
  const rect = element.getBoundingClientRect()
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
}

export type GeometryDelta = {
  maxDeltaX: number
  maxDeltaY: number
  maxDeltaWidth: number
  maxDeltaHeight: number
  meanDeltaMagnitude: number
  samples: number
}

export function summariseDeltas(
  samples: ReadonlyArray<{ dx: number; dy: number; dw: number; dh: number }>,
): GeometryDelta {
  if (samples.length === 0) {
    return {
      maxDeltaX: 0,
      maxDeltaY: 0,
      maxDeltaWidth: 0,
      maxDeltaHeight: 0,
      meanDeltaMagnitude: 0,
      samples: 0,
    }
  }
  let maxDeltaX = 0
  let maxDeltaY = 0
  let maxDeltaWidth = 0
  let maxDeltaHeight = 0
  let magnitudeSum = 0
  for (const sample of samples) {
    maxDeltaX = Math.max(maxDeltaX, Math.abs(sample.dx))
    maxDeltaY = Math.max(maxDeltaY, Math.abs(sample.dy))
    maxDeltaWidth = Math.max(maxDeltaWidth, Math.abs(sample.dw))
    maxDeltaHeight = Math.max(maxDeltaHeight, Math.abs(sample.dh))
    magnitudeSum += Math.hypot(sample.dx, sample.dy)
  }
  return {
    maxDeltaX: Number(maxDeltaX.toFixed(3)),
    maxDeltaY: Number(maxDeltaY.toFixed(3)),
    maxDeltaWidth: Number(maxDeltaWidth.toFixed(3)),
    maxDeltaHeight: Number(maxDeltaHeight.toFixed(3)),
    meanDeltaMagnitude: Number((magnitudeSum / samples.length).toFixed(3)),
    samples: samples.length,
  }
}

export function useActiveTargetDriver(enabled: boolean, count = spikeTargets.length) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let lastSwitch = performance.now()
    const step = (timestamp: number) => {
      if (timestamp - lastSwitch > 320) {
        lastSwitch = timestamp
        setActiveIndex((current) => (current + 1) % count)
      }
      frame = scheduleUncountedFrame(step)
    }
    frame = scheduleUncountedFrame(step)
    return () => cancelUncountedFrame(frame)
  }, [count, enabled])

  return activeIndex
}

export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function useComputedBackdropFilter(getElement: () => HTMLElement | null) {
  const [computed, setComputed] = useState<SpikeMetricValue>(null)

  const read = useCallback(() => {
    const element = getElement()
    if (!element) {
      setComputed(null)
      return
    }
    const pseudo = getComputedStyle(element, '::before')
    const own = getComputedStyle(element)
    const value =
      pseudo.backdropFilter && pseudo.backdropFilter !== 'none'
        ? pseudo.backdropFilter
        : (pseudo as unknown as Record<string, string>).webkitBackdropFilter ||
          own.backdropFilter ||
          'none'
    setComputed(value || 'none')
  }, [getElement])

  return [computed, read] as const
}

export function OutcomeLabel({ label, detail }: { label: string; detail?: string }) {
  return (
    <p
      data-lens-spike-outcome
      className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs font-medium"
    >
      {label}
      {detail ? <span className="ml-2 font-normal text-muted-foreground">{detail}</span> : null}
    </p>
  )
}
