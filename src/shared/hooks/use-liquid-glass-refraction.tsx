import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createEdgeDisplacementMap, supportsLiquidGlassRefraction } from '../lib/liquid-glass'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

type LiquidGlassRefractionOptions = {
  enabled: boolean
  /** Whether the material itself is pressable. Static chrome only tracks the rim highlight. */
  interactive?: boolean
  /** Corner radius of the surface, CSS px. */
  radius?: number
  /** Refraction zone reach from the boundary inward, CSS px. */
  edgeWidth?: number
  /** feDisplacementMap scale at rest, CSS px of maximum displacement. */
  refraction?: number
  /** Scattering (feGaussianBlur stdDeviation) applied after refraction. */
  scattering?: number
  saturation?: number
}

type FilterState = {
  href: string
  width: number
  height: number
}

/**
 * Drives the experimental refraction backend for one glass surface.
 *
 * Layer split: this hook owns backdrop scattering + edge refraction (inside
 * the SVG filter). Tint, rim highlight, and shadow stay in the CSS material;
 * foreground content is never processed. Pointer position feeds the local rim
 * highlight (CSS vars); press raises refraction strength via the filter scale.
 */
export function useLiquidGlassRefraction({
  enabled,
  interactive = false,
  radius = 10,
  edgeWidth = 14,
  refraction = 22,
  scattering = 9,
  saturation = 1.35,
}: LiquidGlassRefractionOptions) {
  const elementRef = useRef<HTMLElement | null>(null)
  const pointerFrame = useRef<number | null>(null)
  const lastGeometry = useRef<string | null>(null)
  const filterId = `liquid-glass-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const [filter, setFilter] = useState<FilterState | null>(null)
  const [pressed, setPressed] = useState(false)
  const [prefersReducedTransparency, setPrefersReducedTransparency] = useState(false)
  const supported = typeof window !== 'undefined' && supportsLiquidGlassRefraction()
  const forcedFallback =
    typeof document !== 'undefined' &&
    document.documentElement.dataset.glassCapability === 'fallback'
  const active = enabled && supported && !prefersReducedTransparency && !forcedFallback

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia('(prefers-reduced-transparency: reduce)')
    const updatePreference = () => setPrefersReducedTransparency(media.matches)

    updatePreference()
    media.addEventListener('change', updatePreference)

    return () => media.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    const element = elementRef.current

    if (!active || !element) {
      lastGeometry.current = null
      setFilter(null)
      return
    }

    let debounce: ReturnType<typeof setTimeout> | null = null

    const regenerate = () => {
      const rect = element.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)
      const geometry = `${width}:${height}:${radius}:${edgeWidth}`

      if (geometry === lastGeometry.current) {
        return
      }

      const href = createEdgeDisplacementMap({ width, height, radius, edgeWidth })

      lastGeometry.current = href ? geometry : null

      setFilter(href ? { href, width, height } : null)
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
  }, [active, edgeWidth, radius])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const element = elementRef.current

    if (!element || pointerFrame.current !== null) {
      return
    }

    const { clientX, clientY } = event

    pointerFrame.current = requestAnimationFrame(() => {
      pointerFrame.current = null
      const rect = element.getBoundingClientRect()

      element.style.setProperty(
        '--glass-pointer-x',
        `${Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)).toFixed(2)}%`,
      )
      element.style.setProperty(
        '--glass-pointer-y',
        `${Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)).toFixed(2)}%`,
      )
    })
  }, [])

  useEffect(
    () => () => {
      if (pointerFrame.current !== null) {
        cancelAnimationFrame(pointerFrame.current)
      }
    },
    [],
  )

  const handlers = useMemo(
    () => ({
      onPointerMove: handlePointerMove,
      onPointerDown: () => {
        if (interactive) {
          setPressed(true)
        }
      },
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onPointerCancel: () => setPressed(false),
    }),
    [handlePointerMove, interactive],
  )

  const style: CSSProperties | undefined =
    active && filter
      ? ({ '--glass-experimental-filter': `url(#${filterId})` } as CSSProperties)
      : undefined

  const filterNode: ReactNode =
    active && filter ? (
      <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
        <filter
          id={filterId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={filter.href}
            x="0"
            y="0"
            width={filter.width}
            height={filter.height}
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={pressed ? refraction * 1.45 : refraction}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation={scattering} result="scattered" />
          <feColorMatrix in="scattered" type="saturate" values={`${saturation}`} />
        </filter>
      </svg>
    ) : null

  return {
    ref: elementRef,
    active: active && filter !== null,
    pressed,
    style,
    filterNode,
    handlers,
  }
}
