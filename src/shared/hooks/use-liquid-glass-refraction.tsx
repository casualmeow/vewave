import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createEdgeDisplacementMap, supportsLiquidGlassRefraction } from '../lib/liquid-glass'
import { LiquidGlassFilter } from '../ui/liquid-glass-filter'
import { ModalGlassFilter } from '../ui/modal-glass-filter'
import { createModalGlassMaps, getModalGlassStyle } from '../lib/modal-glass'
import { resolveGlassMotion } from '../theme/glass-motion'
import { useGlassInteractionScope } from '../lib/glass-interaction-scope'
import { useGlassAppearance } from './use-glass-appearance'
import { useModalGlassMotion } from './use-modal-glass-motion'
import type { GlassMotion } from '../theme/contract'
import type { ModalGlassMaps } from '../lib/modal-glass'
import type { LiquidGlassMap } from '../ui/liquid-glass-filter'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

type LiquidGlassRefractionOptions = {
  enabled: boolean

  profile?: 'edge' | 'modal'
  motion?: 'auto' | GlassMotion

  motionEnabled?: boolean

  interactive?: boolean

  radius?: number | 'auto'

  edgeWidth?: number

  refraction?: number

  scattering?: number
  saturation?: number
}

type FilterState = LiquidGlassMap | ModalGlassMaps

export function useLiquidGlassRefraction({
  enabled,
  profile = 'edge',
  motion = 'auto',
  motionEnabled = enabled,
  interactive = false,
  radius = 'auto',
  edgeWidth = 14,
  refraction = 22,
  scattering,
  saturation = 1.1,
}: LiquidGlassRefractionOptions) {
  const appearance = useGlassAppearance()
  const scope = useGlassInteractionScope()
  const glassMotion = resolveGlassMotion({
    ...appearance,
    requested: motion,
    preference: appearance.glassMotion,
  })
  const elementRef = useRef<HTMLElement | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node
    setElement(node)
  }, [])
  const pointerFrame = useRef<number | null>(null)
  const filterId = `liquid-glass-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const [filter, setFilter] = useState<FilterState | null>(null)
  const [pressed, setPressed] = useState(false)
  const supported = typeof window !== 'undefined' && supportsLiquidGlassRefraction()
  const active =
    enabled && supported && !appearance.reducedTransparency && !appearance.forceFallback
  const modalIntensity = profile === 'modal' ? appearance.glassIntensity : null
  const modalMap = active && filter && 'mask' in filter ? filter : null
  const modalRefs = useModalGlassMotion(element, modalMap, glassMotion, motionEnabled)

  useEffect(() => {
    if (!active || !element) {
      setFilter(null)
      return
    }

    let debounce: ReturnType<typeof setTimeout> | null = null
    let lastGeometry = ''

    const regenerate = () => {
      const width = element.offsetWidth
      const height = element.offsetHeight
      const cssRadius = getComputedStyle(element).borderTopLeftRadius
      const measuredRadius =
        radius === 'auto'
          ? (Number.parseFloat(cssRadius) || 0) *
            (cssRadius.includes('%') ? Math.min(width, height) / 100 : 1)
          : radius
      const geometry = `${width}:${height}:${measuredRadius}:${edgeWidth}:${modalIntensity}`

      if (geometry === lastGeometry) {
        return
      }

      lastGeometry = geometry
      try {
        if (modalIntensity) {
          setFilter(
            createModalGlassMaps({
              width,
              height,
              radius: measuredRadius,
              intensity: modalIntensity,
            }),
          )
          return
        }
        const href = createEdgeDisplacementMap({ width, height, radius: measuredRadius, edgeWidth })
        setFilter(href ? { href, width, height } : null)
      } catch {
        setFilter(null)
      }
    }

    const observer = new ResizeObserver(() => {
      if (debounce) {
        clearTimeout(debounce)
      }
      debounce = setTimeout(regenerate, 120)
    })

    regenerate()
    observer.observe(element)

    return () => {
      observer.disconnect()
      if (debounce) {
        clearTimeout(debounce)
      }
    }
  }, [active, element, edgeWidth, radius, modalIntensity])

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        scope ||
        !enabled ||
        profile === 'modal' ||
        glassMotion !== 'fluid' ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches
      )
        return
      const target = elementRef.current

      if (!target || pointerFrame.current !== null) {
        return
      }

      const { clientX, clientY } = event

      pointerFrame.current = requestAnimationFrame(() => {
        pointerFrame.current = null
        const rect = target.getBoundingClientRect()

        target.style.setProperty(
          '--glass-pointer-x',
          `${Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)).toFixed(2)}%`,
        )
        target.style.setProperty(
          '--glass-pointer-y',
          `${Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)).toFixed(2)}%`,
        )
      })
    },
    [enabled, glassMotion, profile, scope],
  )

  useEffect(() => {
    if (glassMotion !== 'fluid') {
      elementRef.current?.style.removeProperty('--glass-pointer-x')
      elementRef.current?.style.removeProperty('--glass-pointer-y')
    }
    return () => {
      if (pointerFrame.current !== null) {
        cancelAnimationFrame(pointerFrame.current)
        pointerFrame.current = null
      }
    }
  }, [glassMotion])

  const handlers = useMemo(
    () => ({
      onPointerMove: handlePointerMove,
      onPointerDown: () => {
        if (!scope && enabled && interactive && glassMotion === 'fluid') {
          setPressed(true)
        }
      },
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onPointerCancel: () => setPressed(false),
    }),
    [enabled, glassMotion, handlePointerMove, interactive, scope],
  )

  const style = {
    ...(enabled && profile === 'modal'
      ? getModalGlassStyle(appearance.resolvedMode, appearance.glassIntensity)
      : {}),
    ...(active && filter
      ? {
          '--glass-refraction-filter': `url(#${filterId})${profile !== 'modal' && scattering === undefined ? ' blur(min(6px, calc(var(--glass-blur-base, 3px) * var(--glass-thickness, 1))))' : ''}`,
        }
      : {}),
  } as CSSProperties

  const filterNode: ReactNode = modalMap ? (
    <ModalGlassFilter
      id={filterId}
      map={modalMap}
      refs={modalRefs}
      mode={appearance.resolvedMode}
    />
  ) : active && filter && 'href' in filter ? (
    <LiquidGlassFilter
      id={filterId}
      map={filter}
      refraction={pressed && glassMotion === 'fluid' ? refraction * 1.2 : refraction}
      scattering={scattering ?? 0}
      saturation={saturation}
    />
  ) : null

  return {
    ref,
    active: active && filter !== null,
    motion: glassMotion,
    pressed,
    style,
    filterNode,
    handlers,
  }
}
