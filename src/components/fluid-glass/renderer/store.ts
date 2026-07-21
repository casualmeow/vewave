import { LensMotionController } from './store/lens-motion-controller'
import { LensStateMachine } from './store/lens-state-machine'
import { MaterialState } from './store/material-state'
import { RendererScheduler } from './store/renderer-scheduler'
import {
  TargetRegistry,
  type PointerVelocityUpdate,
  type TargetRegistryEvent,
} from './store/target-registry'
import { TelemetryStore } from './store/telemetry-store'
import type {
  FluidGlassBehavior,
  FluidGlassMaterial,
  FluidGlassRadius,
  FluidGlassRect,
  FluidGlassScopeId,
  FluidGlassSemanticEventType,
  FluidGlassShape,
  FluidGlassTargetState,
  FluidGlassTraceValue,
  FluidGlassTransitionCommand,
  FluidGlassTransitionChangeKind,
  FluidGlassTransitionDebugSnapshot,
  FluidGlassTransitionTraceEntry,
  FluidTransmissionMaterial,
} from '../types'

export {
  LensMotionController,
  LensStateMachine,
  MaterialState,
  RendererScheduler,
  TargetRegistry,
  TelemetryStore,
}

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

function cloneRect(rect: FluidGlassRect | null | undefined) {
  return rect ? { ...rect } : null
}

function rectEqual(left: FluidGlassRect | null, right: FluidGlassRect | null) {
  if (left === right) return true
  if (!left || !right) return false
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height &&
    left.radius === right.radius &&
    left.shape === right.shape
  )
}

function timestampNow() {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

function recordEqual(
  left: Readonly<Record<FluidGlassScopeId, string>>,
  right: Readonly<Record<FluidGlassScopeId, string>>,
) {
  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)
  return (
    leftEntries.length === rightEntries.length &&
    leftEntries.every(([scopeId, targetId]) => right[scopeId] === targetId)
  )
}

export class FluidGlassStore {
  readonly scheduler = new RendererScheduler()
  readonly materialState = new MaterialState()
  readonly telemetry = new TelemetryStore()
  readonly motion: LensMotionController
  readonly stateMachine: LensStateMachine
  readonly registry: TargetRegistry

  private transitionGeneration = 0
  private resolvedTargetId: string | null = null
  private currentScopeId: FluidGlassScopeId | null = null
  private transitionSnapshot = emptyTransitionSnapshot
  private activeSyncQueued = false
  private pendingActiveEvent: TargetRegistryEvent | null = null
  private scopeFallbackQueued = false
  private pendingScopeFallbackEvent: TargetRegistryEvent | null = null

  constructor(reducedMotion = false) {
    this.motion = new LensMotionController(this.scheduler, reducedMotion)
    this.stateMachine = new LensStateMachine(
      this.materialState,
      this.motion,
      () => this.registry.groupElement,
    )
    this.registry = new TargetRegistry(this.scheduler, this.handleRegistryChange)
  }

  get targets() {
    return this.registry.targets
  }

  get current() {
    return this.motion.current
  }

  get desired() {
    return this.stateMachine.desired
  }

  get resolvedTarget() {
    return this.resolvedTargetId ? (this.registry.targets.get(this.resolvedTargetId) ?? null) : null
  }

  get currentTransitionGeneration() {
    return this.transitionGeneration
  }

  get currentLensScopeId() {
    return this.currentScopeId
  }

  get activeTargetsByScope() {
    return this.registry.getActiveTargetsByScope()
  }

  setResolvedMaterials(
    material: FluidGlassMaterial,
    transmissionMaterial: FluidTransmissionMaterial,
  ) {
    this.materialState.setResolvedMaterials(material, transmissionMaterial)
  }

  setReducedMotion(reducedMotion: boolean) {
    this.motion.setReducedMotion(reducedMotion)
    this.commitTransition({
      eventType: 'desired-rect-change',
      sourceTargetId: this.resolvedTargetId,
      reason: 'reduced-motion preference changed',
      trace: false,
    })
  }

  setGroup(element: HTMLElement | null) {
    this.registry.setGroup(element)
    if (!element) this.motion.cancel()
  }

  subscribe(listener: () => void) {
    return this.scheduler.subscribe(listener)
  }

  registerTarget(
    id: string,
    element: HTMLElement,
    options: {
      active: boolean
      behaviors?: ReadonlyArray<FluidGlassBehavior>
      disabled?: boolean
      radius: FluidGlassRadius
      scopeId?: FluidGlassScopeId
      shape: FluidGlassShape
    },
  ) {
    this.registry.registerTarget(id, element, {
      ...options,
      behaviors: options.behaviors ?? ['selection', 'hover', 'press', 'drag'],
      disabled: options.disabled ?? false,
      scopeId: options.scopeId ?? 'default',
    })
  }

  unregisterTarget(id: string) {
    this.registry.unregisterTarget(id)
  }

  updateTarget(
    id: string,
    options: Partial<
      Pick<
        FluidGlassTargetState,
        | 'active'
        | 'behaviors'
        | 'disabled'
        | 'hovered'
        | 'pressed'
        | 'dragged'
        | 'focused'
        | 'scopeId'
        | 'shape'
        | 'radius'
      >
    >,
    event: TargetRegistryEvent = {
      eventType: 'selection-change',
      sourceTargetId: id,
      reason: 'target state updated',
    },
  ) {
    this.registry.updateTarget(id, options, event)
  }

  commitSelection(scopeId: FluidGlassScopeId, targetId: string) {
    const target = this.registry.targets.get(targetId)
    if (!target || target.scopeId !== scopeId || target.disabled) return
    this.currentScopeId = scopeId
    this.registry.commitSelection(scopeId, targetId, {
      eventType: 'selection-change',
      sourceScopeId: scopeId,
      sourceTargetId: targetId,
      reason: 'explicit selection commit changed persistent lens scope',
    })
  }

  handlePointerOver(path: ReadonlyArray<EventTarget>) {
    const targetId = this.registry.findTargetIdInPath(path)
    if (targetId) {
      this.registry.setHoveredTarget(
        targetId,
        'pointer-enter',
        'group pointer delegation resolved target',
      )
    }
  }

  handlePointerOut(path: ReadonlyArray<EventTarget>, relatedTarget: EventTarget | null) {
    const sourceTargetId = this.registry.findTargetIdInPath(path)
    if (!sourceTargetId) return
    const nextTargetId = this.registry.findTargetIdForNode(relatedTarget)
    if (nextTargetId === sourceTargetId) return
    if (nextTargetId) {
      this.registry.setHoveredTarget(
        nextTargetId,
        'pointer-enter',
        'pointer moved directly between registered targets',
      )
      return
    }
    this.registry.scheduleHoverClear(sourceTargetId)
  }

  recordSemanticEvent(
    eventType: FluidGlassSemanticEventType,
    sourceTargetId: string | null,
    reason: string,
  ) {
    this.commitTransition({
      eventType,
      sourceScopeId: sourceTargetId
        ? (this.registry.targets.get(sourceTargetId)?.scopeId ?? null)
        : null,
      sourceTargetId,
      reason,
    })
  }

  updatePointerVelocity(id: string, velocity: PointerVelocityUpdate) {
    this.registry.updatePointerVelocity(id, velocity)
  }

  measureNow() {
    this.registry.measureNow()
  }

  scheduleMeasurement = () => {
    this.registry.scheduleMeasurement()
  }

  getSelectedTarget() {
    return this.registry.getSelectedTarget(this.currentScopeId)
  }

  destroy() {
    this.registry.destroy()
    this.telemetry.destroy()
    this.scheduler.destroy()
  }

  private handleRegistryChange = (event: TargetRegistryEvent) => {
    const sourceScopeId =
      event.sourceScopeId ??
      (event.sourceTargetId
        ? (this.registry.targets.get(event.sourceTargetId)?.scopeId ?? null)
        : null)
    const scopedEvent = { ...event, sourceScopeId }

    if (sourceScopeId && (event.eventType === 'pointer-down' || event.eventType === 'focus')) {
      this.currentScopeId = sourceScopeId
    } else if (event.eventType === 'register' && this.currentScopeId === null) {
      this.currentScopeId = this.registry.getDeterministicInitialScopeId()
    }

    if (event.eventType === 'active-prop-change') {
      this.pendingActiveEvent = scopedEvent
      if (this.activeSyncQueued) return
      this.activeSyncQueued = true
      queueMicrotask(() => {
        this.activeSyncQueued = false
        const activeEvent = this.pendingActiveEvent
        this.pendingActiveEvent = null
        if (activeEvent) {
          if (!this.registry.getActiveTarget(this.currentScopeId)) {
            this.currentScopeId = this.registry.getDeterministicInitialScopeId()
          }
          this.commitTransition(activeEvent)
        }
      })
      return
    }
    if (event.eventType === 'unregister' && !this.registry.getActiveTarget(this.currentScopeId)) {
      this.pendingScopeFallbackEvent = scopedEvent
      if (this.scopeFallbackQueued) return
      this.scopeFallbackQueued = true
      queueMicrotask(() => {
        this.scopeFallbackQueued = false
        const fallbackEvent = this.pendingScopeFallbackEvent
        this.pendingScopeFallbackEvent = null
        if (fallbackEvent && !this.registry.getActiveTarget(this.currentScopeId)) {
          this.currentScopeId = this.registry.getDeterministicInitialScopeId()
          this.commitTransition(fallbackEvent)
        }
      })
      return
    }
    this.commitTransition(scopedEvent)
  }

  private commitTransition(event: TargetRegistryEvent) {
    const selected = this.registry.getSelectedTarget(this.currentScopeId)
    const nextResolvedTargetId = selected?.id ?? null
    const resolvedChanged = nextResolvedTargetId !== this.resolvedTargetId
    if (resolvedChanged) {
      this.transitionGeneration += 1
      this.resolvedTargetId = nextResolvedTargetId
    }

    const command: FluidGlassTransitionCommand = {
      generation: this.transitionGeneration,
      targetId: nextResolvedTargetId,
      rect: cloneRect(selected?.rect),
      shape: selected?.shape ?? 'rounded-rect',
      radius: selected?.rect?.radius ?? 0,
    }
    this.stateMachine.retarget(command, selected)
    if (event.trace !== false) this.publishTransitionTrace(event, selected, resolvedChanged)
  }

  private publishTransitionTrace(
    event: TargetRegistryEvent,
    selected: FluidGlassTargetState | null,
    resolvedChanged: boolean,
  ) {
    const previous = this.transitionSnapshot
    const hoveredTargetId = this.registry.getStateTargetId('hovered')
    const pressedTargetId = this.registry.getStateTargetId('pressed')
    const draggedTargetId = this.registry.getStateTargetId('dragged')
    const focusedTargetId = this.registry.getStateTargetId('focused')
    const targetScope = (targetId: string | null) =>
      targetId ? (this.registry.targets.get(targetId)?.scopeId ?? null) : null
    const nextState = {
      activeTargetByScope: this.registry.getActiveTargetsByScope(),
      currentScopeId: this.currentScopeId,
      hoveredTargetId,
      hoveredTargetScopeId: targetScope(hoveredTargetId),
      pressedTargetId,
      pressedTargetScopeId: targetScope(pressedTargetId),
      draggedTargetId,
      draggedTargetScopeId: targetScope(draggedTargetId),
      focusedTargetId,
      focusedTargetScopeId: targetScope(focusedTargetId),
      resolvedTargetId: this.resolvedTargetId,
      transitionGeneration: this.transitionGeneration,
      desiredRect: this.resolvedTargetId ? cloneRect(this.desired) : null,
      resolvedRect: cloneRect(selected?.rect),
      currentRect: this.current.width > 0 ? cloneRect(this.current) : null,
    }
    const entries: Array<FluidGlassTransitionTraceEntry> = []
    const timestamp = timestampNow()
    const addEntry = (
      field: FluidGlassTransitionTraceEntry['field'],
      previousValue: FluidGlassTraceValue,
      nextValue: FluidGlassTraceValue,
      changeKind: FluidGlassTransitionChangeKind,
      eventType = event.eventType,
    ) => {
      entries.push({
        timestamp,
        eventType,
        sourceScopeId: event.sourceScopeId ?? null,
        sourceTargetId: event.sourceTargetId,
        field,
        previousValue,
        nextValue,
        reason: event.reason,
        changeKind,
      })
    }

    if (!recordEqual(previous.activeTargetByScope, nextState.activeTargetByScope)) {
      addEntry(
        'activeTargetByScope',
        previous.activeTargetByScope,
        nextState.activeTargetByScope,
        'membership-only',
      )
    }
    if (previous.currentScopeId !== nextState.currentScopeId) {
      addEntry(
        'currentScopeId',
        previous.currentScopeId,
        nextState.currentScopeId,
        'scope-ownership',
      )
    }
    for (const field of [
      'hoveredTargetId',
      'pressedTargetId',
      'draggedTargetId',
      'focusedTargetId',
    ] as const) {
      if (previous[field] !== nextState[field]) {
        addEntry(field, previous[field], nextState[field], 'semantic-only')
      }
    }
    if (previous.resolvedTargetId !== nextState.resolvedTargetId) {
      addEntry(
        'resolvedTargetId',
        previous.resolvedTargetId,
        nextState.resolvedTargetId,
        'resolved-target',
        'resolved-target-change',
      )
    }
    if (!rectEqual(previous.desiredRect, nextState.desiredRect)) {
      addEntry(
        'desiredRect',
        previous.desiredRect,
        nextState.desiredRect,
        'geometry-only',
        'desired-rect-change',
      )
    }
    if (resolvedChanged) {
      addEntry(
        'currentRect',
        previous.currentRect,
        nextState.currentRect,
        'geometry-only',
        'resolved-target-change',
      )
    }
    if (entries.length === 0) {
      const changeKind: FluidGlassTransitionChangeKind =
        event.eventType === 'measurement-complete'
          ? 'geometry-only'
          : event.eventType === 'active-prop-change'
            ? 'membership-only'
            : 'semantic-only'
      addEntry('event', null, event.sourceTargetId, changeKind)
    }

    const timeline = [...entries, ...previous.timeline].slice(0, 36)
    const lastSemanticEvent = entries[entries.length - 1]
    const lastScopeChangingEvent =
      [...entries].reverse().find((entry) => entry.changeKind === 'scope-ownership') ??
      previous.lastScopeChangingEvent
    const lastTargetChangingEvent =
      [...entries].reverse().find((entry) => entry.changeKind === 'resolved-target') ??
      previous.lastTargetChangingEvent
    this.transitionSnapshot = {
      ...nextState,
      lastSemanticEvent,
      lastScopeChangingEvent,
      lastTargetChangingEvent,
      timeline,
    }
    this.telemetry.publishTransition(this.transitionSnapshot)
  }
}
