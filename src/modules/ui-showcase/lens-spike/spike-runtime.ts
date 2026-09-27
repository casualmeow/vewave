import type { SpikeMetricValue } from './types'

export function getInstrumentation() {
  return typeof window === 'undefined' ? undefined : window.__lensSpike
}

export function instrumentationSnapshot(): Record<string, SpikeMetricValue> {
  const instrumentation = getInstrumentation()
  if (!instrumentation) {
    return { instrumentationReady: false }
  }
  return { instrumentationReady: true, ...instrumentation.snapshot() }
}

export function scheduleUncountedFrame(callback: FrameRequestCallback) {
  const instrumentation = getInstrumentation()
  return instrumentation
    ? instrumentation.rawRequestAnimationFrame(callback)
    : requestAnimationFrame(callback)
}

export function cancelUncountedFrame(handle: number) {
  const instrumentation = getInstrumentation()
  if (instrumentation) instrumentation.rawCancelAnimationFrame(handle)
  else cancelAnimationFrame(handle)
}

export function readMemory(): number | null {
  const instrumentation = getInstrumentation()
  return instrumentation ? instrumentation.readMemory() : null
}

function percentile(sorted: ReadonlyArray<number>, fraction: number) {
  if (sorted.length === 0) return null
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))
  return Number(sorted[index].toFixed(3))
}

export type FrameSample = {
  frameSampleCount: number
  frameIntervalMedianMs: number | null
  frameIntervalP95Ms: number | null
  frameIntervalMaxMs: number | null
  frameSampleWindowMs: number | null
}

export const emptyFrameSample: FrameSample = {
  frameSampleCount: 0,
  frameIntervalMedianMs: null,
  frameIntervalP95Ms: null,
  frameIntervalMaxMs: null,
  frameSampleWindowMs: null,
}

export function sampleFrames(frameCount: number): Promise<FrameSample> {
  return new Promise((resolve) => {
    const intervals: Array<number> = []
    let previous = performance.now()
    const startedAt = previous
    let remaining = frameCount

    const step = (timestamp: number) => {
      intervals.push(timestamp - previous)
      previous = timestamp
      remaining -= 1
      if (remaining > 0) {
        scheduleUncountedFrame(step)
        return
      }

      const measured = intervals.slice(1).sort((left, right) => left - right)
      resolve({
        frameSampleCount: measured.length,
        frameIntervalMedianMs: percentile(measured, 0.5),
        frameIntervalP95Ms: percentile(measured, 0.95),
        frameIntervalMaxMs: measured.length
          ? Number(measured[measured.length - 1].toFixed(3))
          : null,
        frameSampleWindowMs: Number((previous - startedAt).toFixed(3)),
      })
    }

    scheduleUncountedFrame(step)
  })
}

export function waitFrames(count: number) {
  return new Promise<void>((resolve) => {
    let remaining = count
    const step = () => {
      remaining -= 1
      if (remaining <= 0) resolve()
      else scheduleUncountedFrame(step)
    }
    scheduleUncountedFrame(step)
  })
}

export function roundMetric(value: number, digits = 3) {
  return Number(value.toFixed(digits))
}
