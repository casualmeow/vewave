import type { LensBackend, LensBackendReason, LensBackendResolution } from './backend-resolution'
import type { LensCapabilitySnapshot } from './capability'
import type { LensGeometryPolicy } from './geometry-policy'
import type { LensRecoverySnapshot } from './context-recovery'
import type { LensRendererLifecycleState } from './renderer-lifecycle'
import type { LensSourceCategory, LensSourceReadability } from './backdrop-source'

export type LensVisualMode = 'solid' | 'css' | 'refractive'

export type LensConsumerState = {
  materialAvailable: boolean
  visualMode: LensVisualMode
  degraded: boolean
  unavailable: boolean
}

export function toConsumerState(resolution: LensBackendResolution): LensConsumerState {
  const backend = resolution.backend
  const visualMode: LensVisualMode =
    backend === 'solid'
      ? 'solid'
      : backend === 'sdf' || backend === 'transmission-experimental' || backend === 'native-svg'
        ? 'refractive'
        : 'css'

  return {
    materialAvailable: backend !== 'solid',
    visualMode,
    degraded: resolution.degraded,
    unavailable: backend === 'solid' && resolution.precedence !== 'intent',
  }
}

export type LensDebugEventType =
  | 'backend-resolved'
  | 'source-readability-changed'
  | 'context-created'
  | 'context-lost'
  | 'context-restored'
  | 'recovery-attempt'
  | 'recovery-terminal'
  | 'renderer-disposed'
  | 'scope-acquired'
  | 'scope-denied'
  | 'scope-released'
  | 'lifecycle-transition'

export type LensDebugEvent = {
  type: LensDebugEventType
  timestamp: number
  scopeId: string | null
  detail: string
}

export type LensDebugSnapshot = {
  backend: LensBackend
  resolutionReason: LensBackendReason
  sourceCategory: LensSourceCategory
  sourceReadability: LensSourceReadability
  scopeId: string | null
  scopeOwnerId: string | null
  ownsWebglScope: boolean
  lifecycleState: LensRendererLifecycleState
  recovery: LensRecoverySnapshot
  geometryPolicy: LensGeometryPolicy
  capability: LensCapabilitySnapshot
  events: ReadonlyArray<LensDebugEvent>
}

const MAX_DEBUG_EVENTS = 32

export class LensDebugChannel {
  private events: Array<LensDebugEvent> = []
  private readonly listeners = new Set<() => void>()

  constructor(private readonly enabled: boolean = import.meta.env.DEV) {}

  record(type: LensDebugEventType, detail: string, scopeId: string | null = null): void {
    if (!this.enabled) return
    this.events = [
      ...this.events.slice(-(MAX_DEBUG_EVENTS - 1)),
      { type, timestamp: Date.now(), scopeId, detail },
    ]
    for (const listener of this.listeners) listener()
  }

  get recorded(): ReadonlyArray<LensDebugEvent> {
    return this.events
  }

  subscribe(listener: () => void): () => void {
    if (!this.enabled) return () => undefined
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  destroy(): void {
    this.events = []
    this.listeners.clear()
  }
}
