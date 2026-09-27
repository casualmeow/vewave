import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import { FluidGlassFallbackLens, rimAngle, sheenOrigin } from '../ui/fallback-lens'
import type { LensStateAdapter } from '../lens/lens-state'
import type { LensBackend, LensBackendReason } from '../lens/backend-resolution'
import type { FluidGlassEnvironmentSource, FluidGlassMaterial } from '../types'
import { createEdgeDisplacementMap } from '@/shared/lib/liquid-glass'
import { LiquidGlassFilter, type LiquidGlassMap } from '@/shared/ui/liquid-glass-filter'
import { useGlassAppearance } from '@/shared/hooks/use-glass-appearance'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'

function sizeDisplacementImage(image: SVGFEImageElement | null, width: number, height: number) {
  image?.setAttribute('width', String(width))
  image?.setAttribute('height', String(height))
}

export function FluidGlassDomRenderer({
  lens,
  backend,
  reason,
  material,
  environment,
  lightDirection,
  onUnavailable,
}: {
  lens: LensStateAdapter
  backend: LensBackend
  reason: LensBackendReason
  material: FluidGlassMaterial
  environment: FluidGlassEnvironmentSource
  lightDirection: readonly [number, number]
  onUnavailable: () => void
}) {
  const carrier = useRef<HTMLDivElement>(null)
  const displacement = useRef<SVGFEDisplacementMapElement>(null)
  const mapImage = useRef<SVGFEImageElement>(null)
  const filterId = `fluid-glass-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const [map, setMap] = useState<LiquidGlassMap | null>(null)
  const native = backend === 'native-svg'
  const { glassIntensity, resolvedMode } = useGlassAppearance()
  const optical = resolveGlassMaterial({
    mode: resolvedMode,
    intensity: glassIntensity,
    role: 'control',
  })

  const refraction = optical.displacement * 2

  useLayoutEffect(() => {
    const { current } = lens.read()
    sizeDisplacementImage(mapImage.current, current.width, current.height)
  }, [lens, map, native])

  useEffect(() => {
    let geometryKey = ''
    const sheen = sheenOrigin(lightDirection)
    const rim = rimAngle(lightDirection)
    const apply = () => {
      const element = carrier.current
      if (!element) return
      const state = lens.read()
      const { current, desired, motion } = state
      const radius =
        current.shape === 'rounded-rect'
          ? current.radius
          : Math.min(current.width, current.height) / 2
      element.style.visibility = state.visible ? 'visible' : 'hidden'
      element.style.width = `${current.width}px`
      element.style.height = `${current.height}px`
      element.style.borderRadius = `${radius}px`
      element.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      sizeDisplacementImage(mapImage.current, current.width, current.height)
      const speed = Math.hypot(motion.velocityX, motion.velocityY)
      const energy = Math.min(
        1,
        Math.max(
          speed / 700,
          Math.abs(motion.scaleX - 1) / 0.068,
          Math.abs(motion.scaleY - 1) / 0.068,
        ),
      )
      const dx = speed > 1 ? motion.velocityX / speed : 0
      const dy = speed > 1 ? motion.velocityY / speed : 0
      const set = (name: string, value: string | number) =>
        element.style.setProperty(name, String(value))
      set('--lens-body-scale-x', motion.scaleX)
      set('--lens-body-scale-y', motion.scaleY)
      set('--lens-sheen-x', `${sheen.x - dx * energy * 12}%`)
      set('--lens-sheen-y', `${sheen.y - dy * energy * 12}%`)
      set('--lens-rim-angle', `${rim + dx * energy * 18}deg`)
      set('--lens-light-response', 1 + energy * 0.2)
      set('--glass-blur-base', `${optical.centerBlur}px`)
      set('--lens-scattering', native ? optical.edgeBlur / optical.centerBlur : 0.7)
      displacement.current?.setAttribute('scale', String(refraction * (1 + energy * 0.2)))

      if (!native || desired.width < 8 || desired.height < 8) return
      const width = Math.round(desired.width)
      const height = Math.round(desired.height)
      const targetRadius =
        desired.shape === 'rounded-rect' ? desired.radius : Math.min(width, height) / 2
      const edgeWidth = Math.max(2, Math.min(optical.bevel, Math.min(width, height) * 0.24))
      const key = `${width}:${height}:${targetRadius}:${edgeWidth}`
      if (key === geometryKey) return
      geometryKey = key
      try {
        const href = createEdgeDisplacementMap({ width, height, radius: targetRadius, edgeWidth })
        if (href) setMap({ href, width, height })
        else onUnavailable()
      } catch {
        onUnavailable()
      }
    }
    apply()
    return lens.subscribe(apply)
  }, [
    lens,
    lightDirection,
    native,
    onUnavailable,
    refraction,
    optical.bevel,
    optical.centerBlur,
    optical.edgeBlur,
  ])

  return (
    <>
      {environment.type !== 'auto-dom' && backend !== 'solid' ? (
        <div
          aria-hidden
          data-fluid-glass-environment={environment.type}
          data-pattern={environment.type === 'theme' ? environment.pattern : undefined}
          data-tone={environment.type === 'theme' ? environment.tone : undefined}
          className="fluid-glass-css-environment pointer-events-none absolute inset-0 z-0"
          style={
            environment.type === 'image'
              ? { backgroundImage: `url(${JSON.stringify(environment.src)})` }
              : undefined
          }
        />
      ) : null}
      {native && map ? (
        <LiquidGlassFilter
          id={filterId}
          map={map}
          refraction={refraction}
          displacementRef={displacement}
          imageRef={mapImage}
        />
      ) : null}
      <FluidGlassFallbackLens
        ref={carrier}
        backend={backend}
        reason={reason}
        material={material}
        lightDirection={lightDirection}
        filterUrl={native && map ? `url(#${filterId})` : undefined}
      />
    </>
  )
}
