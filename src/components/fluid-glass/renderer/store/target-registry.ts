import { resolveTargetRadius, toGroupRelativeRect } from '../geometry'
import type {
  FluidGlassBehavior,
  FluidGlassRadius,
  FluidGlassRect,
  FluidGlassScopeId,
  FluidGlassSemanticEventType,
  FluidGlassShape,
  FluidGlassTargetState,
} from '../../types'
import type { RendererScheduler } from './renderer-scheduler'

export type PointerVelocityUpdate = {
  rawX: number
  rawY: number
  smoothedX: number
  smoothedY: number
  normalized: number
  clampedX: number
  clampedY: number
}

export type TargetRegistryEvent = {
  eventType: FluidGlassSemanticEventType
  sourceScopeId?: FluidGlassScopeId | null
  sourceTargetId: string | null
  reason: string
  trace?: boolean
}

export type TargetMeasurementToken = {
  targetId: string
  measurementGeneration: number
  layoutGeneration: number
  element: HTMLElement
}

type TargetRegistrationOptions = {
  active: boolean
  behaviors: ReadonlyArray<FluidGlassBehavior>
  disabled: boolean
  radius: FluidGlassRadius
  scopeId: FluidGlassScopeId
  shape: FluidGlassShape
}

type TargetUpdate = Partial<
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
>

function supportsBehavior(target: FluidGlassTargetState, behavior: FluidGlassBehavior) {
  return target.behaviors.includes(behavior)
}

function getInteractionPriority(target: FluidGlassTargetState) {
  if (target.disabled) return 0
  if (target.dragged && supportsBehavior(target, 'drag')) return 4
  if (target.pressed && supportsBehavior(target, 'press')) return 3
  if (target.hovered && supportsBehavior(target, 'hover')) return 2
  return 0
}

function behaviorsEqual(
  current: ReadonlyArray<FluidGlassBehavior>,
  next: ReadonlyArray<FluidGlassBehavior>,
) {
  return (
    current.length === next.length && current.every((behavior, index) => behavior === next[index])
  )
}

function rectEqual(current: FluidGlassRect | null, next: FluidGlassRect) {
  return (
    current?.x === next.x &&
    current.y === next.y &&
    current.width === next.width &&
    current.height === next.height &&
    current.radius === next.radius &&
    current.shape === next.shape
  )
}

export class TargetRegistry {
  readonly targets = new Map<string, FluidGlassTargetState>()
  readonly activeTargetByScope = new Map<FluidGlassScopeId, string>()

  private group: HTMLElement | null = null
  private groupObserver: ResizeObserver | null = null
  private readonly targetObservers = new Map<string, ResizeObserver>()
  private interactionOrder = 0
  private layoutGeneration = 0
  private hoverClearFrame: number | null = null

  constructor(
    private readonly scheduler: RendererScheduler,
    private readonly onChange: (event: TargetRegistryEvent) => void,
  ) {}

  get groupElement() {
    return this.group
  }

  setGroup(element: HTMLElement | null) {
    this.groupObserver?.disconnect()
    this.groupObserver = null
    this.group = element
    this.layoutGeneration += 1

    if (!element) {
      this.scheduler.cancelMeasurement()
      return
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.groupObserver = new ResizeObserver(() => this.scheduleMeasurement())
      this.groupObserver.observe(element)
    }

    this.measureNow()
  }

  registerTarget(id: string, element: HTMLElement, options: TargetRegistrationOptions) {
    const previous = this.targets.get(id)
    this.removeTarget(id)
    if (options.active) this.clearActiveScope(options.scopeId, id)

    const registeredOrder = options.active
      ? (this.interactionOrder += 1)
      : (previous?.interactionOrder ?? 0)
    this.targets.set(id, {
      id,
      scopeId: options.scopeId,
      element,
      rect: null,
      active: options.active,
      behaviors: [...options.behaviors],
      disabled: options.disabled,
      hovered: previous?.hovered ?? false,
      pressed: previous?.pressed ?? false,
      dragged: previous?.dragged ?? false,
      focused: previous?.focused ?? false,
      radius: options.radius,
      shape: options.shape,
      pointerVelocityX: previous?.pointerVelocityX ?? 0,
      pointerVelocityY: previous?.pointerVelocityY ?? 0,
      rawPointerVelocityX: previous?.rawPointerVelocityX ?? 0,
      rawPointerVelocityY: previous?.rawPointerVelocityY ?? 0,
      smoothedPointerVelocityX: previous?.smoothedPointerVelocityX ?? 0,
      smoothedPointerVelocityY: previous?.smoothedPointerVelocityY ?? 0,
      normalizedPointerVelocity: previous?.normalizedPointerVelocity ?? 0,
      interactionOrder: registeredOrder,
      measurementGeneration: 0,
      layoutGeneration: this.layoutGeneration,
    })
    if (options.active) this.activeTargetByScope.set(options.scopeId, id)

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.scheduleMeasurement(id))
      observer.observe(element)
      this.targetObservers.set(id, observer)
    }

    this.onChange({
      eventType: 'register',
      sourceScopeId: options.scopeId,
      sourceTargetId: id,
      reason: 'target mounted',
    })
    this.measureNow(id)
  }

  unregisterTarget(id: string) {
    const target = this.targets.get(id)
    if (!target) return
    this.removeTarget(id)
    this.layoutGeneration += 1
    this.onChange({
      eventType: 'unregister',
      sourceScopeId: target.scopeId,
      sourceTargetId: id,
      reason: 'target unmounted',
    })
  }

  updateTarget(id: string, options: TargetUpdate, event: TargetRegistryEvent) {
    const target = this.targets.get(id)
    if (!target) return

    const nextBehaviors = options.behaviors ?? target.behaviors
    const nextScopeId = options.scopeId ?? target.scopeId
    const changed =
      (options.active !== undefined && options.active !== target.active) ||
      (options.disabled !== undefined && options.disabled !== target.disabled) ||
      (options.hovered !== undefined && options.hovered !== target.hovered) ||
      (options.pressed !== undefined && options.pressed !== target.pressed) ||
      (options.dragged !== undefined && options.dragged !== target.dragged) ||
      (options.focused !== undefined && options.focused !== target.focused) ||
      (options.scopeId !== undefined && options.scopeId !== target.scopeId) ||
      (options.shape !== undefined && options.shape !== target.shape) ||
      (options.radius !== undefined && options.radius !== target.radius) ||
      (options.behaviors !== undefined && !behaviorsEqual(target.behaviors, nextBehaviors))
    if (!changed) return

    const previousScopeId = target.scopeId
    if (nextScopeId !== previousScopeId && this.activeTargetByScope.get(previousScopeId) === id) {
      this.activeTargetByScope.delete(previousScopeId)
    }
    if (options.active === true) this.clearActiveScope(nextScopeId, id)
    if (options.hovered === true) this.clearExclusiveState('hovered', id)
    if (options.pressed === true) this.clearExclusiveState('pressed', id)
    if (options.dragged === true) this.clearExclusiveState('dragged', id)
    if (options.focused === true) this.clearExclusiveState('focused', id)

    const promotesTarget =
      options.hovered === true ||
      options.pressed === true ||
      options.dragged === true ||
      (options.active === true && !target.active)
    if (promotesTarget) {
      this.interactionOrder += 1
      target.interactionOrder = this.interactionOrder
    }

    Object.assign(target, options, { behaviors: [...nextBehaviors], scopeId: nextScopeId })
    if (target.active) this.activeTargetByScope.set(target.scopeId, id)
    else if (this.activeTargetByScope.get(target.scopeId) === id) {
      this.activeTargetByScope.delete(target.scopeId)
    }
    if (target.disabled) {
      target.hovered = false
      target.pressed = false
      target.dragged = false
      target.focused = false
    } else {
      if (!supportsBehavior(target, 'hover')) target.hovered = false
      if (!supportsBehavior(target, 'press')) target.pressed = false
      if (!supportsBehavior(target, 'drag')) target.dragged = false
    }

    if ('shape' in options || 'radius' in options || 'disabled' in options) {
      this.scheduleMeasurement(id)
    }
    this.onChange(event)
  }

  setHoveredTarget(
    id: string | null,
    eventType: 'pointer-enter' | 'pointer-leave',
    reason: string,
  ) {
    this.cancelHoverClear()
    const nextTarget = id ? this.targets.get(id) : null
    const nextId =
      nextTarget && !nextTarget.disabled && supportsBehavior(nextTarget, 'hover')
        ? nextTarget.id
        : null
    const currentId = this.getStateTargetId('hovered')
    const currentTarget = currentId ? this.targets.get(currentId) : null
    if (currentId === nextId) return

    for (const target of this.targets.values()) target.hovered = target.id === nextId
    if (nextId) {
      this.interactionOrder += 1
      const promoted = this.targets.get(nextId)
      if (promoted) promoted.interactionOrder = this.interactionOrder
    }
    this.onChange({
      eventType,
      sourceScopeId: nextTarget?.scopeId ?? currentTarget?.scopeId ?? null,
      sourceTargetId: nextId ?? currentId,
      reason,
    })
  }

  scheduleHoverClear(sourceTargetId: string) {
    this.cancelHoverClear()
    if (typeof requestAnimationFrame === 'undefined') {
      this.setHoveredTarget(null, 'pointer-leave', 'pointer left target')
      return
    }
    this.hoverClearFrame = requestAnimationFrame(() => {
      this.hoverClearFrame = null
      if (this.getStateTargetId('hovered') !== sourceTargetId) return
      this.setHoveredTarget(null, 'pointer-leave', 'pointer left target after hover handoff frame')
    })
  }

  findTargetIdInPath(path: ReadonlyArray<EventTarget>) {
    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue
      for (const target of this.targets.values()) {
        if (target.element === node) return target.id
      }
    }
    return null
  }

  findTargetIdForNode(node: EventTarget | null) {
    if (!(node instanceof Node)) return null
    for (const target of this.targets.values()) {
      if (target.element === node || target.element.contains(node)) return target.id
    }
    return null
  }

  notifyEvent(event: TargetRegistryEvent) {
    this.onChange(event)
  }

  commitSelection(scopeId: FluidGlassScopeId, targetId: string, event: TargetRegistryEvent) {
    const target = this.targets.get(targetId)
    if (!target || target.disabled || target.scopeId !== scopeId) return
    this.clearActiveScope(scopeId, targetId)
    target.active = true
    this.activeTargetByScope.set(scopeId, targetId)
    this.interactionOrder += 1
    target.interactionOrder = this.interactionOrder
    this.onChange(event)
  }

  updatePointerVelocity(id: string, velocity: PointerVelocityUpdate) {
    const target = this.targets.get(id)
    if (!target) return
    target.rawPointerVelocityX = velocity.rawX
    target.rawPointerVelocityY = velocity.rawY
    target.smoothedPointerVelocityX = velocity.smoothedX
    target.smoothedPointerVelocityY = velocity.smoothedY
    target.normalizedPointerVelocity = velocity.normalized
    target.pointerVelocityX = velocity.clampedX
    target.pointerVelocityY = velocity.clampedY
    this.onChange({
      eventType: 'pointer-down',
      sourceTargetId: id,
      reason: 'pointer velocity updated without changing ownership',
      trace: false,
    })
  }

  measureNow(sourceTargetId: string | null = null) {
    const tokens = this.createMeasurementBatch()
    this.measureTokens(tokens, sourceTargetId)
  }

  scheduleMeasurement = (sourceTargetId: string | null = null) => {
    const tokens = this.createMeasurementBatch()
    this.scheduler.scheduleMeasurement(() => this.measureTokens(tokens, sourceTargetId))
  }

  beginMeasurement(targetId: string) {
    const target = this.targets.get(targetId)
    if (!target) return null
    this.layoutGeneration += 1
    return this.createMeasurementToken(target, this.layoutGeneration)
  }

  applyMeasuredRect(token: TargetMeasurementToken, rect: FluidGlassRect) {
    const applied = this.commitMeasuredRect(token, rect)
    if (applied) {
      this.onChange({
        eventType: 'measurement-complete',
        sourceScopeId: this.targets.get(token.targetId)?.scopeId ?? null,
        sourceTargetId: token.targetId,
        reason: `measurement ${token.measurementGeneration}/${token.layoutGeneration} applied`,
      })
    }
    return applied
  }

  getStateTargetId(field: 'hovered' | 'pressed' | 'dragged' | 'focused') {
    let selected: FluidGlassTargetState | null = null
    for (const target of this.targets.values()) {
      if (!target[field] || target.disabled) continue
      if (!selected || target.interactionOrder > selected.interactionOrder) selected = target
    }
    return selected?.id ?? null
  }

  getActiveTarget(scopeId: FluidGlassScopeId | null) {
    if (!scopeId) return null
    const targetId = this.activeTargetByScope.get(scopeId)
    const target = targetId ? this.targets.get(targetId) : null
    return target && target.active && !target.disabled ? target : null
  }

  getDeterministicInitialScopeId() {
    for (const [scopeId, targetId] of this.activeTargetByScope) {
      const target = this.targets.get(targetId)
      if (target?.active && !target.disabled) return scopeId
    }
    return null
  }

  getActiveTargetsByScope() {
    return Object.fromEntries(this.activeTargetByScope) as Readonly<
      Record<FluidGlassScopeId, string>
    >
  }

  getSelectedTarget(currentScopeId: FluidGlassScopeId | null) {
    let selected: FluidGlassTargetState | null = null
    let priority = 0
    let interactionOrder = -1

    for (const target of this.targets.values()) {
      const nextPriority = getInteractionPriority(target)
      if (
        nextPriority > priority ||
        (nextPriority === priority &&
          nextPriority > 0 &&
          target.interactionOrder > interactionOrder)
      ) {
        selected = target
        priority = nextPriority
        interactionOrder = target.interactionOrder
      }
    }

    if (selected) return selected
    return (
      this.getActiveTarget(currentScopeId) ??
      this.getActiveTarget(this.getDeterministicInitialScopeId())
    )
  }

  destroy() {
    this.cancelHoverClear()
    this.groupObserver?.disconnect()
    for (const observer of this.targetObservers.values()) observer.disconnect()
    this.targetObservers.clear()
    this.targets.clear()
    this.activeTargetByScope.clear()
    this.group = null
  }

  private createMeasurementBatch() {
    this.layoutGeneration += 1
    const layoutGeneration = this.layoutGeneration
    return [...this.targets.values()].map((target) =>
      this.createMeasurementToken(target, layoutGeneration),
    )
  }

  private createMeasurementToken(target: FluidGlassTargetState, layoutGeneration: number) {
    target.measurementGeneration += 1
    target.layoutGeneration = layoutGeneration
    return {
      targetId: target.id,
      measurementGeneration: target.measurementGeneration,
      layoutGeneration,
      element: target.element,
    }
  }

  private measureTokens(
    tokens: ReadonlyArray<TargetMeasurementToken>,
    sourceTargetId: string | null,
  ) {
    if (!this.group || tokens.length === 0) return
    const groupRect = this.group.getBoundingClientRect()
    let applied = false

    for (const token of tokens) {
      const target = this.targets.get(token.targetId)
      if (!target || !token.element.isConnected) continue
      const rect = token.element.getBoundingClientRect()
      const radius = resolveTargetRadius(
        token.element,
        target.shape,
        target.radius,
        rect.width,
        rect.height,
      )
      const measuredRect = toGroupRelativeRect(rect, groupRect, radius, target.shape)
      applied = this.commitMeasuredRect(token, measuredRect) || applied
    }

    if (applied) {
      this.onChange({
        eventType: 'measurement-complete',
        sourceTargetId,
        reason: `layout generation ${tokens[0].layoutGeneration} applied`,
      })
    }
  }

  private commitMeasuredRect(token: TargetMeasurementToken, rect: FluidGlassRect) {
    const target = this.targets.get(token.targetId)
    if (
      !target ||
      target.element !== token.element ||
      target.measurementGeneration !== token.measurementGeneration ||
      target.layoutGeneration !== token.layoutGeneration ||
      token.layoutGeneration !== this.layoutGeneration
    ) {
      return false
    }
    if (rectEqual(target.rect, rect)) return false
    target.rect = { ...rect }
    return true
  }

  private clearExclusiveState(
    field: 'hovered' | 'pressed' | 'dragged' | 'focused',
    exceptId: string,
  ) {
    for (const target of this.targets.values()) {
      if (target.id !== exceptId) target[field] = false
    }
  }

  private clearActiveScope(scopeId: FluidGlassScopeId, exceptId: string) {
    for (const target of this.targets.values()) {
      if (target.scopeId === scopeId && target.id !== exceptId) target.active = false
    }
    const current = this.activeTargetByScope.get(scopeId)
    if (current && current !== exceptId) this.activeTargetByScope.delete(scopeId)
  }

  private cancelHoverClear() {
    if (this.hoverClearFrame === null) return
    cancelAnimationFrame(this.hoverClearFrame)
    this.hoverClearFrame = null
  }

  private removeTarget(id: string) {
    const target = this.targets.get(id)
    if (target && this.activeTargetByScope.get(target.scopeId) === id) {
      this.activeTargetByScope.delete(target.scopeId)
    }
    this.targetObservers.get(id)?.disconnect()
    this.targetObservers.delete(id)
    this.targets.delete(id)
  }
}
