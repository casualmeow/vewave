import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { GlassInteractionEvent } from './glass-interaction'

type Receiver = (event: GlassInteractionEvent) => void
export type GlassInteractionRegistry = {
  register: (element: HTMLElement, receive: Receiver) => () => void
}

const GlassInteractionContext = createContext<GlassInteractionRegistry | null>(null)

export function createGlassInteractionRegistry() {
  const surfaces = new Map<HTMLElement, Set<Receiver>>()
  let current: HTMLElement | null = null
  let settling: HTMLElement | null = null
  const resetEvent = (): GlassInteractionEvent => ({
    phase: 'reset',
    input: 'keyboard',
    x: 0,
    y: 0,
    time: performance.now(),
  })
  const send = (element: HTMLElement | null, event: GlassInteractionEvent) => {
    if (element) surfaces.get(element)?.forEach((receive) => receive(event))
  }
  function reset() {
    surfaces.forEach((receivers) => receivers.forEach((receive) => receive(resetEvent())))
    current = null
    settling = null
  }

  function dispatch(event: GlassInteractionEvent, path: ReadonlyArray<EventTarget>) {
    if (event.phase === 'reset' || event.input === 'keyboard' || document.hidden) {
      reset()
      return
    }
    if (event.phase === 'release' || event.phase === 'exit') {
      if (settling && settling !== current) send(settling, resetEvent())
      send(current, event)
      settling = current
      current = null
      return
    }
    const target = path.find((node): node is HTMLElement => node instanceof HTMLElement)
    const editing = target?.closest('input, textarea, [contenteditable="true"]')
    const surface = editing
      ? null
      : (path.find(
          (node): node is HTMLElement =>
            node instanceof HTMLElement &&
            surfaces.has(node) &&
            node.isConnected &&
            !node.closest('[inert], [aria-hidden="true"], [data-state="closed"]'),
        ) ?? null)
    if (surface !== current) {
      if (settling && settling !== surface) send(settling, resetEvent())
      send(current, { ...event, phase: 'exit' })
      settling = current
      current = surface
    }
    send(current, event)
  }

  return {
    register(element: HTMLElement, receive: Receiver) {
      const receivers = surfaces.get(element) ?? new Set<Receiver>()
      receivers.add(receive)
      surfaces.set(element, receivers)
      return () => {
        receive(resetEvent())
        receivers.delete(receive)
        if (receivers.size > 0) return
        surfaces.delete(element)
        if (current === element) current = null
        if (settling === element) settling = null
      }
    },
    dispatch,
    reset,
  }
}

export function GlassInteractionScope({ children }: { children: ReactNode }) {
  const registry = useMemo(createGlassInteractionRegistry, [])
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    let touching = false
    let touchId: number | null = null
    const handle = (phase: GlassInteractionEvent['phase']) => (event: PointerEvent) => {
      const input =
        event.pointerType === 'touch' || event.pointerType === 'pen' ? event.pointerType : 'mouse'
      if (input === 'touch' && touchId !== null && touchId !== event.pointerId) return
      if (phase === 'move' && (input === 'touch' || touching || !fine.matches)) return
      if (phase === 'press' && input === 'touch') {
        touching = true
        touchId = event.pointerId
      }
      if (phase === 'release') {
        touching = false
        touchId = null
      }
      registry.dispatch(
        { phase, input, x: event.clientX, y: event.clientY, time: performance.now() },
        event.composedPath(),
      )
    }
    const move = handle('move')
    const down = handle('press')
    const up = handle('release')
    const reset = () => {
      touching = false
      touchId = null
      registry.reset()
    }
    const out = (event: PointerEvent) => {
      if (!event.relatedTarget) reset()
    }
    const key = (event: KeyboardEvent) => {
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) reset()
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', reset)
    window.addEventListener('pointerout', out)
    window.addEventListener('blur', reset)
    window.addEventListener('keydown', key)
    window.addEventListener('scroll', reset, { passive: true, capture: true })
    document.addEventListener('visibilitychange', reset)
    fine.addEventListener('change', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', reset)
      window.removeEventListener('pointerout', out)
      window.removeEventListener('blur', reset)
      window.removeEventListener('keydown', key)
      window.removeEventListener('scroll', reset, true)
      document.removeEventListener('visibilitychange', reset)
      fine.removeEventListener('change', reset)
      reset()
    }
  }, [registry])
  return <GlassInteractionContext value={registry}>{children}</GlassInteractionContext>
}

export function useGlassInteractionScope() {
  return useContext(GlassInteractionContext)
}
