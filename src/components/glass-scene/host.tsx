import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { GlassSceneRenderer, GlassSceneSourceFactory, ScenePane } from './types'
import type { GlassMotion } from '@/shared/theme/contract'
import type { ResolvedGlassMaterial } from '@/shared/lib/glass-material'
import type { GlassSceneRegistry } from '@/shared/lib/glass-scene-context'
import { GlassSceneContext } from '@/shared/lib/glass-scene-context'
import { useGlassMotion } from '@/shared/hooks/use-glass-appearance'
import { cn } from '@/shared/lib/utils'
import { useGlassInteractionScope } from '@/shared/lib/glass-interaction-scope'

type RegisteredPane = {
  id: string
  element: HTMLElement
  material: ResolvedGlassMaterial
  onReady: (ready: boolean) => void
}

export type GlassSceneHostProps<T> = {
  children?: ReactNode
  source?: GlassSceneSourceFactory<T>
  sourceOptions: T
  enabled?: boolean
  paused?: boolean
  motion?: GlassMotion
  onReadyChange?: (ready: boolean) => void

  className?: string
  style?: CSSProperties
}

export function GlassSceneHost<T>({
  children,
  source,
  sourceOptions,
  enabled = true,
  paused = false,
  motion,
  className,
  style,
  onReadyChange,
}: GlassSceneHostProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const interactionScope = useGlassInteractionScope()
  const rendererRef = useRef<GlassSceneRenderer<T> | null>(null)
  const panes = useRef(new Map<string, RegisteredPane>())
  const observerRef = useRef<ResizeObserver | null>(null)
  const measureRef = useRef<() => void>(() => {})
  const latest = useRef(sourceOptions)
  latest.current = sourceOptions
  const resolvedMotion = useGlassMotion(motion)
  const pausedRef = useRef(paused)
  const motionRef = useRef(resolvedMotion)
  const readyCallback = useRef(onReadyChange)
  readyCallback.current = onReadyChange
  pausedRef.current = paused
  motionRef.current = resolvedMotion
  const [ready, setReady] = useState(false)

  const registry = useMemo<GlassSceneRegistry>(
    () => ({
      register(id, element, material, onReady) {
        const pane = { id, element, material, onReady }
        panes.current.set(id, pane)
        const releaseInteraction = interactionScope?.register(element, (event) => {
          const bounds = canvasRef.current?.getBoundingClientRect()
          if (!bounds) return
          rendererRef.current?.setInteraction(id, {
            ...event,
            x: event.x - bounds.left,
            y: event.y - bounds.top,
          })
        })
        observerRef.current?.observe(element)
        onReady(false)
        measureRef.current()
        return () => {
          if (panes.current.get(id) !== pane) return
          observerRef.current?.unobserve(element)
          releaseInteraction?.()
          panes.current.delete(id)
          onReady(false)
          measureRef.current()
        }
      },
    }),
    [interactionScope],
  )

  useEffect(() => {
    if (!enabled || !source || !canvasRef.current) return
    const canvas = canvasRef.current
    let cancelled = false
    let frame: number | null = null
    let transitionUntil = 0
    let paintedPanes = new Set<string>()
    const publish = (value: boolean) => {
      if (cancelled) return
      setReady(value)
      readyCallback.current?.(value)
      for (const pane of panes.current.values()) pane.onReady(value && paintedPanes.has(pane.id))
    }
    const measure = () => {
      frame = null
      if (cancelled) return
      const renderer = rendererRef.current
      if (!renderer) return
      const bounds = canvas.getBoundingClientRect()
      renderer.setSize(bounds.width, bounds.height)
      const measured: Array<ScenePane> = []
      for (const pane of panes.current.values()) {
        const rect = pane.element.getBoundingClientRect()
        const hidden = pane.element.closest('[hidden], [inert], [aria-hidden="true"]')
        if (hidden || rect.width <= 1 || rect.height <= 1) {
          pane.onReady(false)
          continue
        }
        const cssRadius = getComputedStyle(pane.element).borderTopLeftRadius
        const radius =
          (Number.parseFloat(cssRadius) || 0) *
          (cssRadius.includes('%') ? Math.min(rect.width, rect.height) / 100 : 1)
        measured.push({
          id: pane.id,
          x: rect.left - bounds.left,
          y: rect.top - bounds.top,
          width: rect.width,
          height: rect.height,
          radius,
          material: pane.material,
        })
      }
      paintedPanes = new Set(measured.map((pane) => pane.id))
      renderer.setPanes(measured)
      if (performance.now() < transitionUntil) scheduleMeasure()
    }
    const scheduleMeasure = () => {
      if (!cancelled && frame === null) frame = requestAnimationFrame(measure)
    }
    measureRef.current = scheduleMeasure
    const observer = new ResizeObserver(scheduleMeasure)
    observerRef.current = observer
    observer.observe(canvas)
    for (const pane of panes.current.values()) observer.observe(pane.element)
    const onTransition = (event: TransitionEvent) => {
      if (![...panes.current.values()].some((pane) => pane.element === event.target)) return
      if (event.type === 'transitionrun') transitionUntil = performance.now() + 1000
      else transitionUntil = 0
      scheduleMeasure()
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const bounds = canvas.getBoundingClientRect()
      rendererRef.current?.setPointer(event.clientX - bounds.left, event.clientY - bounds.top, true)
    }
    const clearPointer = () => rendererRef.current?.setPointer(0, 0, false)
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) clearPointer()
    }
    window.addEventListener('resize', scheduleMeasure)
    window.addEventListener('scroll', scheduleMeasure, true)
    if (!interactionScope) {
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('pointerout', onPointerOut)
      window.addEventListener('pointercancel', clearPointer)
      window.addEventListener('blur', clearPointer)
    }
    document.addEventListener('transitionrun', onTransition)
    document.addEventListener('transitionend', onTransition)
    document.addEventListener('transitioncancel', onTransition)
    void import('./renderer')
      .then(({ createGlassSceneRenderer }) => {
        if (cancelled) return
        const renderer = createGlassSceneRenderer(canvas, {
          source,
          sourceOptions: latest.current,
          motion: motionRef.current,
          onFrame: () => publish(true),
          onError: () => publish(false),
        })
        if (cancelled) {
          renderer?.destroy()
          return
        }
        rendererRef.current = renderer
        renderer?.setPaused(pausedRef.current)
        measure()
      })
      .catch(() => publish(false))
    return () => {
      publish(false)
      cancelled = true
      if (frame !== null) cancelAnimationFrame(frame)
      observer.disconnect()
      observerRef.current = null
      measureRef.current = () => {}
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('scroll', scheduleMeasure, true)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('pointercancel', clearPointer)
      window.removeEventListener('blur', clearPointer)
      document.removeEventListener('transitionrun', onTransition)
      document.removeEventListener('transitionend', onTransition)
      document.removeEventListener('transitioncancel', onTransition)
      rendererRef.current?.destroy()
      rendererRef.current = null
      for (const pane of panes.current.values()) pane.onReady(false)
    }
  }, [enabled, source, interactionScope])

  useEffect(() => rendererRef.current?.setSourceOptions(sourceOptions), [sourceOptions])
  useEffect(() => rendererRef.current?.setPaused(paused), [paused])
  useEffect(() => rendererRef.current?.setMotion(resolvedMotion), [resolvedMotion])

  return (
    <GlassSceneContext.Provider value={registry}>
      {enabled && source ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-glass-scene-host=""
          data-glass-scene-state={ready ? 'ready' : 'fallback'}
          className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
          style={{ ...style, visibility: ready ? 'visible' : 'hidden' }}
        />
      ) : null}
      {children}
    </GlassSceneContext.Provider>
  )
}
