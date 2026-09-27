import type { SpikeEvidenceClass } from './spike-evidence'

export type SpikeMode = 'measure' | 'capture'

export type SpikeStatus = 'observed' | 'degraded' | 'unavailable' | 'error'

export type SpikeMetricValue = number | string | boolean | null

export type SpikeScenarioId =
  | 'arbitrary-dom'
  | 'controlled-image'
  | 'fallback-edges'
  | 'transformed-target'
  | 'teardown'
  | 'context-loss'
  | 'scope-sweep'
  | 'scroll-and-portal'

export type SpikeScenarioProps = {
  variant: string
  mode: SpikeMode

  amount: number
  onReady: () => void
  publish: (metrics: Record<string, SpikeMetricValue>) => void
  setStatus: (status: SpikeStatus) => void
  note: (message: string) => void

  complete: () => void
}

export type SpikeScenarioDefinition = {
  id: SpikeScenarioId
  title: string
  blocking: ReadonlyArray<string>

  visual: boolean
  variants: ReadonlyArray<string>
  amounts?: ReadonlyArray<number>
  description: string
}

export type LensSpikeInstrumentation = {
  rawRequestAnimationFrame: (callback: FrameRequestCallback) => number
  rawCancelAnimationFrame: (handle: number) => void
  liveResizeObserverCount: () => number
  pendingRafCount: () => number
  readMemory: () => number | null
  reset: () => void
  snapshot: () => Record<string, SpikeMetricValue>
  restore: () => void
}

declare global {
  interface Window {
    __lensSpike?: LensSpikeInstrumentation
    __lensSpikeConfig?: {
      forceWebglFailure?: boolean
      forceNativeSvgUnavailable?: boolean
      reducedTransparency?: boolean
    }

    __lensSpikeReport?: {
      scenarioId: string
      variant: string
      mode: SpikeMode

      status: SpikeEvidenceClass

      rawStatus: SpikeStatus
      evidenceValid: boolean
      previewOnly: boolean
      evidenceReason: string | null
      executionMode: 'manual' | 'runner'
      prerequisitesReady: boolean
      scenarioReady: boolean
      spikeComplete: boolean
      metrics: Record<string, SpikeMetricValue>
      notes: Array<string>
    }
  }
}
