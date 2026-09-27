import { ACTIVE_LENS_GEOMETRY_POLICY, type LensGeometryPolicy } from './geometry-policy'
import type { FluidGlassShape } from '../types'
import type { FluidGlassStore } from '../renderer/store'

export type LensGeometry = {
  x: number
  y: number
  width: number
  height: number
  radius: number
  shape: FluidGlassShape
}

export type LensInteractionState = {
  hovered: boolean
  pressed: boolean
  dragged: boolean
  focused: boolean
}

export type LensMotionIntent = {
  velocityX: number
  velocityY: number
  scaleX: number
  scaleY: number
  energy: number
}

export type LensStateSnapshot = {
  resolvedTargetId: string | null
  scopeId: string | null
  current: LensGeometry
  desired: LensGeometry
  opacity: number
  visible: boolean
  interaction: LensInteractionState
  motion: LensMotionIntent
  geometryPolicy: LensGeometryPolicy
  generation: number
}

const emptyGeometry: LensGeometry = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  shape: 'rounded-rect',
}

const idleInteraction: LensInteractionState = {
  hovered: false,
  pressed: false,
  dragged: false,
  focused: false,
}

export const emptyLensStateSnapshot: LensStateSnapshot = {
  resolvedTargetId: null,
  scopeId: null,
  current: emptyGeometry,
  desired: emptyGeometry,
  opacity: 0,
  visible: false,
  interaction: idleInteraction,
  motion: { velocityX: 0, velocityY: 0, scaleX: 1, scaleY: 1, energy: 0 },
  geometryPolicy: ACTIVE_LENS_GEOMETRY_POLICY,
  generation: 0,
}

type GeometrySource = {
  x: number
  y: number
  width: number
  height: number
  radius: number
  shape: FluidGlassShape
}

function toGeometry(source: GeometrySource): LensGeometry {
  return {
    x: source.x,
    y: source.y,
    width: source.width,
    height: source.height,
    radius: source.radius,
    shape: source.shape,
  }
}

export function readLensState(
  store: FluidGlassStore,
  geometryPolicy: LensGeometryPolicy = ACTIVE_LENS_GEOMETRY_POLICY,
): LensStateSnapshot {
  const current = store.current
  const desired = store.desired
  const target = store.resolvedTarget

  return {
    resolvedTargetId: target?.id ?? null,
    scopeId: store.currentLensScopeId,
    current: toGeometry(current),
    desired: toGeometry(desired),
    opacity: current.opacity,
    visible: current.opacity > 0 && current.width > 0 && current.height > 0,
    interaction: target
      ? {
          hovered: target.hovered,
          pressed: target.pressed,
          dragged: target.dragged,
          focused: target.focused,
        }
      : idleInteraction,
    motion: {
      velocityX: current.velocityX,
      velocityY: current.velocityY,
      scaleX: current.scaleX,
      scaleY: current.scaleY,
      energy: current.interactionEnergy,
    },
    geometryPolicy,
    generation: store.currentTransitionGeneration,
  }
}

export type LensStateAdapter = {
  read: () => LensStateSnapshot
  subscribe: (listener: () => void) => () => void
}

export function createLensStateAdapter(
  store: FluidGlassStore,
  geometryPolicy: LensGeometryPolicy = ACTIVE_LENS_GEOMETRY_POLICY,
): LensStateAdapter {
  return {
    read: () => readLensState(store, geometryPolicy),
    subscribe: (listener) => store.subscribe(listener),
  }
}
