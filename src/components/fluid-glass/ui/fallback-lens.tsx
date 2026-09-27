import { useMemo, type CSSProperties, type Ref } from 'react'

import type { LensBackend, LensBackendReason } from '../lens/backend-resolution'
import type { FluidGlassMaterial } from '../types'
import { cn } from '@/shared/lib/utils'

export function sheenOrigin(lightDirection: readonly [number, number]) {
  const [lx, ly] = lightDirection
  return {
    x: 50 + lx * 34,

    y: 50 - ly * 34,
  }
}

export function rimAngle(lightDirection: readonly [number, number]) {
  const [lx, ly] = lightDirection
  return (Math.atan2(lx, ly) * 180) / Math.PI
}

type FallbackLensProps = {
  backend: LensBackend
  reason: LensBackendReason
  material: FluidGlassMaterial
  lightDirection: readonly [number, number]
  className?: string
  filterUrl?: string
  ref?: Ref<HTMLDivElement>
}

export function FluidGlassFallbackLens({
  backend,
  className,
  lightDirection,
  material,
  reason,
  filterUrl,
  ref,
}: FallbackLensProps) {
  const solid = backend === 'solid'

  const blurred = backend === 'css-approximation' || backend === 'native-svg'

  const bodyStyle = useMemo(() => {
    const [lx, ly] = lightDirection

    const thickness = Math.min(1, Math.max(0.1, material.physicalThickness))

    const rim = Math.min(0.72, 0.2 + material.rimIntensity * 0.6)
    const inner = Math.min(0.14, 0.02 + material.internalReflection * 0.1)
    const absorption = Math.min(0.34, 0.06 + material.shadowStrength * 0.24)

    const shadowX = -lx * (1.5 + thickness * 3)
    const shadowY = ly * (1.5 + thickness * 3) + 2 + thickness * 4

    const motion = {
      transform:
        'translate3d(var(--lens-body-x, 0px), var(--lens-body-y, 0px), 0) scale(var(--lens-body-scale-x, 1), var(--lens-body-scale-y, 1))',
      transformOrigin: 'var(--lens-body-origin-x, 50%) var(--lens-body-origin-y, 50%)',
    } satisfies CSSProperties

    if (solid) {
      return {
        ...motion,
        borderRadius: 'inherit',
        background: 'var(--card)',
        boxShadow: `0 ${1 + thickness * 3}px ${6 + thickness * 10}px -2px rgb(0 0 0 / ${absorption * 0.6})`,
      } satisfies CSSProperties
    }

    const filter = blurred
      ? `${filterUrl ?? ''} blur(calc(var(--glass-blur-base, 3px) * var(--lens-scattering, 0.7))) saturate(var(--glass-saturate, 110%))`
      : 'none'

    return {
      ...motion,
      borderRadius: 'inherit',
      backdropFilter: filter,
      WebkitBackdropFilter: filter,

      background: `linear-gradient(var(--lens-body-angle, ${(rimAngle(lightDirection) + 180).toFixed(1)}deg),
          color-mix(in srgb, var(--glass-background) ${blurred ? 20 : 75}%, transparent) 0%,
          color-mix(in srgb, var(--glass-background) ${blurred ? 6 : 55}%, transparent) 46%,
          color-mix(in srgb, var(--glass-background) ${blurred ? 12 : 65}%, transparent) 100%)`,
      boxShadow: [
        `0 0 0 0.5px var(--glass-border)`,

        `var(--lens-shadow-x, ${shadowX.toFixed(2)}px) var(--lens-shadow-y, ${shadowY.toFixed(2)}px) ${(8 + thickness * 18).toFixed(1)}px -${(4 + thickness * 4).toFixed(1)}px color-mix(in srgb, var(--material-shadow-color) ${(absorption * 45).toFixed(1)}%, transparent)`,

        `inset 0 0 ${(6 + thickness * 14).toFixed(1)}px color-mix(in srgb, var(--glass-highlight) ${inner * 100}%, transparent)`,

        `inset ${(lx * 1.2).toFixed(2)}px ${(-ly * 1.2).toFixed(2)}px 0.5px color-mix(in srgb, var(--glass-highlight) ${rim * 100}%, transparent)`,

        `inset ${(-lx * 1.5).toFixed(2)}px ${(ly * 1.5).toFixed(2)}px ${(3 + thickness * 6).toFixed(1)}px -1px color-mix(in srgb, var(--material-shadow-color) ${(absorption * 40).toFixed(1)}%, transparent)`,
      ].join(', '),
    } satisfies CSSProperties
  }, [blurred, filterUrl, lightDirection, material, solid])

  const sheen = sheenOrigin(lightDirection)
  const sheenX = sheen.x.toFixed(1)
  const sheenY = sheen.y.toFixed(1)
  const restingRim = rimAngle(lightDirection).toFixed(1)
  const edge = Math.max(
    material.minimumEdgeWidth * 0.4,
    Math.min(material.maximumEdgeWidth * 0.22, 1.6),
  )

  return (
    <div
      ref={ref}
      aria-hidden
      data-fluid-glass-fallback-lens={backend}
      data-fluid-glass-fallback-reason={reason}
      data-fluid-glass-carrier=""
      role="presentation"
      className={cn('pointer-events-none absolute left-0 top-0 z-[1]', className)}
      style={{ visibility: 'hidden' }}
    >
      <div
        aria-hidden
        data-fluid-glass-material-body={backend}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={bodyStyle}
      >
        {solid ? null : (
          <>
            <span
              aria-hidden
              data-fluid-glass-fallback-layer="rim"
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: 'inherit',
                padding: `${edge.toFixed(2)}px`,
                background: `conic-gradient(from var(--lens-rim-angle, ${restingRim}deg),
                    color-mix(in srgb, var(--glass-highlight) ${(34 + material.rimIntensity * 26).toFixed(1)}%, transparent) 0deg,
                    color-mix(in srgb, var(--glass-highlight) 20%, transparent) 62deg,
                    color-mix(in srgb, var(--glass-highlight) 2%, transparent) 150deg,
                    color-mix(in srgb, var(--glass-border) 14%, transparent) 232deg,
                    color-mix(in srgb, var(--glass-highlight) ${(24 + material.rimIntensity * 22).toFixed(1)}%, transparent) 360deg)`,
                opacity: 'calc(0.8 * var(--lens-light-response, 1))',
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
                mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            <span
              aria-hidden
              data-fluid-glass-fallback-layer="sheen"
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: 'inherit',
                transform: `translate(calc(var(--lens-sheen-x, ${sheenX}%) - ${sheenX}%), calc(var(--lens-sheen-y, ${sheenY}%) - ${sheenY}%))`,

                background: `radial-gradient(78% 54% at ${sheenX}% ${sheenY}%,
                    color-mix(in srgb, var(--glass-highlight) ${(5 + material.internalReflection * 8).toFixed(1)}%, transparent) 0%,
                    color-mix(in srgb, var(--glass-highlight) 1.2%, transparent) 24%,
                    transparent 48%)`,
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
