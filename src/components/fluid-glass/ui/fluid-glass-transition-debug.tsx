import { Fragment, useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

import { useFluidGlassStore } from '../context/fluid-glass-context'
import type {
  FluidGlassRect,
  FluidGlassTraceValue,
  FluidGlassTransitionDebugSnapshot,
} from '../types'

const emptySnapshot: FluidGlassTransitionDebugSnapshot = {
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

function applyRect(element: HTMLDivElement | null, rect: FluidGlassRect | null) {
  if (!element) return
  if (!rect) {
    element.style.opacity = '0'
    return
  }
  element.style.opacity = '1'
  element.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`
  element.style.width = `${rect.width}px`
  element.style.height = `${rect.height}px`
  element.style.borderRadius = `${rect.radius}px`
}

function formatValue(value: FluidGlassTraceValue) {
  if (value === null) return '∅'
  if (typeof value === 'object') {
    if (
      'x' in value &&
      typeof value.x === 'number' &&
      'y' in value &&
      typeof value.y === 'number' &&
      'width' in value &&
      typeof value.width === 'number' &&
      'height' in value &&
      typeof value.height === 'number'
    ) {
      return `${value.x.toFixed(0)},${value.y.toFixed(0)} ${value.width.toFixed(0)}×${value.height.toFixed(0)}`
    }
    return Object.entries(value)
      .map(([scopeId, targetId]) => `${scopeId}:${targetId}`)
      .join(', ')
  }
  return String(value)
}

export function FluidGlassTransitionDebug() {
  const store = useFluidGlassStore()
  const currentRectRef = useRef<HTMLDivElement>(null)
  const desiredRectRef = useRef<HTMLDivElement>(null)
  const resolvedRectRef = useRef<HTMLDivElement>(null)
  const subscribe = useCallback(
    (listener: () => void) => store?.telemetry.subscribeTransitions(listener) ?? (() => undefined),
    [store],
  )
  const getSnapshot = useCallback(
    () => store?.telemetry.getTransitionSnapshot() ?? emptySnapshot,
    [store],
  )
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot)
  const activeEntries = Object.entries(snapshot.activeTargetByScope)

  useEffect(() => {
    if (!store) return
    const updateRects = () => {
      const current = store.current
      const currentWidth = current.width * current.scaleX
      const currentHeight = current.height * current.scaleY
      applyRect(
        currentRectRef.current,
        current.width > 0
          ? {
              ...current,
              x: current.x - (currentWidth - current.width) / 2,
              y: current.y - (currentHeight - current.height) / 2,
              width: currentWidth,
              height: currentHeight,
            }
          : null,
      )
      applyRect(desiredRectRef.current, snapshot.resolvedTargetId ? { ...store.desired } : null)
      applyRect(resolvedRectRef.current, store.resolvedTarget?.rect ?? null)
    }
    updateRects()
    return store.subscribe(updateRects)
  }, [snapshot.resolvedTargetId, store])

  if (!import.meta.env.DEV || !store) return null

  return (
    <div
      aria-hidden
      data-fluid-glass-transition-debug
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[inherit]"
    >
      <div ref={currentRectRef} className="absolute left-0 top-0 border border-cyan-300/90" />
      <div
        ref={desiredRectRef}
        className="absolute left-0 top-0 border border-dashed border-amber-300/90"
      />
      <div
        ref={resolvedRectRef}
        className="absolute left-0 top-0 border border-dotted border-fuchsia-300/90"
      />

      <div className="absolute right-3 top-3 w-[min(22rem,calc(100%-1.5rem))] rounded-xl border border-white/10 bg-[#071017]/92 p-3 font-mono text-[0.62rem] leading-4 text-slate-300 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-2 gap-x-3">
          <span className="text-amber-200">scope: {snapshot.currentScopeId ?? '—'}</span>
          <span className="text-fuchsia-200">resolved: {snapshot.resolvedTargetId ?? '—'}</span>
          <span>
            hovered: {snapshot.hoveredTargetId ?? '—'} ({snapshot.hoveredTargetScopeId ?? '—'})
          </span>
          <span>
            pressed: {snapshot.pressedTargetId ?? '—'} ({snapshot.pressedTargetScopeId ?? '—'})
          </span>
          <span>
            focused: {snapshot.focusedTargetId ?? '—'} ({snapshot.focusedTargetScopeId ?? '—'})
          </span>
          <span>generation: {snapshot.transitionGeneration}</span>
        </div>
        <div className="mt-2 border-t border-white/10 pt-2">
          <span className="text-[0.58rem] uppercase tracking-[0.12em] text-slate-500">
            active by scope
          </span>
          <div className="mt-1 grid grid-cols-[4.5rem_1fr] gap-x-2">
            {activeEntries.length > 0 ? (
              activeEntries.map(([scopeId, targetId]) => (
                <Fragment key={scopeId}>
                  <span className="text-slate-500">{scopeId}</span>
                  <span className="truncate">{targetId}</span>
                </Fragment>
              ))
            ) : (
              <span className="col-span-2 text-slate-500">none</span>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-3 border-t border-white/10 pt-2 text-[0.58rem] uppercase tracking-[0.12em]">
          <span className="text-cyan-300">current</span>
          <span className="text-amber-300">desired</span>
          <span className="text-fuchsia-300">DOM</span>
        </div>
        <p className="mt-1 truncate text-slate-400">
          last: {snapshot.lastSemanticEvent?.eventType ?? '—'} ·{' '}
          {snapshot.lastSemanticEvent?.reason ?? 'waiting for target event'}
        </p>
        <p className="truncate text-slate-500">
          scope event: {snapshot.lastScopeChangingEvent?.eventType ?? '—'} ·{' '}
          {snapshot.lastScopeChangingEvent?.sourceTargetId ?? '—'}
        </p>
        <p className="truncate text-slate-500">
          target event: {snapshot.lastTargetChangingEvent?.eventType ?? '—'} ·{' '}
          {snapshot.lastTargetChangingEvent?.sourceTargetId ?? '—'}
        </p>
        <ol className="mt-2 grid gap-0.5 border-t border-white/10 pt-2 text-slate-400">
          {snapshot.timeline.slice(0, 6).map((entry, index) => (
            <li
              key={`${entry.timestamp}-${entry.field}-${index}`}
              className="grid grid-cols-[5.5rem_1fr] gap-2"
            >
              <span className="truncate text-slate-500">{entry.changeKind}</span>
              <span className="truncate">
                {entry.eventType} · {entry.field}: {formatValue(entry.previousValue)} →{' '}
                {formatValue(entry.nextValue)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
