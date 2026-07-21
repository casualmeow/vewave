import type { FluidGlassTelemetry, FluidGlassTransitionDebugSnapshot } from '../../types'

const emptyTransitionSnapshot: FluidGlassTransitionDebugSnapshot = {
  activeTargetByScope: {},
  currentScopeId: null,
  hoveredTargetId: null,
  hoveredTargetScopeId: null,
  pressedTargetId: null,
  pressedTargetScopeId: null,
  draggedTargetId: null,
  draggedTargetScopeId: null,
  focusedTargetId: null,
  focusedTargetScopeId: null,
  resolvedTargetId: null,
  transitionGeneration: 0,
  desiredRect: null,
  resolvedRect: null,
  currentRect: null,
  lastSemanticEvent: null,
  lastScopeChangingEvent: null,
  lastTargetChangingEvent: null,
  timeline: [],
}

export class TelemetryStore {
  private listener: ((telemetry: FluidGlassTelemetry) => void) | undefined
  private readonly transitionListeners = new Set<() => void>()
  private transitionSnapshot = emptyTransitionSnapshot
  private readonly enabled: boolean

  constructor(enabled = import.meta.env.DEV) {
    this.enabled = enabled
  }

  setListener(listener: ((telemetry: FluidGlassTelemetry) => void) | undefined) {
    this.listener = this.enabled ? listener : undefined
  }

  publish = (telemetry: FluidGlassTelemetry) => {
    if (this.enabled) this.listener?.(telemetry)
  }

  getTransitionSnapshot = () => this.transitionSnapshot

  subscribeTransitions = (listener: () => void) => {
    if (!this.enabled) return () => undefined
    this.transitionListeners.add(listener)
    return () => this.transitionListeners.delete(listener)
  }

  publishTransition(snapshot: FluidGlassTransitionDebugSnapshot) {
    if (!this.enabled) return
    this.transitionSnapshot = snapshot
    for (const listener of this.transitionListeners) listener()
  }

  destroy() {
    this.listener = undefined
    this.transitionListeners.clear()
    this.transitionSnapshot = emptyTransitionSnapshot
  }
}
