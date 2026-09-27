import type { Ref } from 'react'

export type LiquidGlassMap = { href: string; width: number; height: number }

export function LiquidGlassFilter({
  id,
  map,
  refraction = 22,
  scattering = 0,
  saturation = 1,
  displacementRef,
  imageRef,
}: {
  id: string
  map: LiquidGlassMap
  refraction?: number
  scattering?: number
  saturation?: number
  displacementRef?: Ref<SVGFEDisplacementMapElement>
  imageRef?: Ref<SVGFEImageElement>
}) {
  return (
    <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <filter
          id={id}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            ref={imageRef}
            href={map.href}
            x="0"
            y="0"
            width={map.width}
            height={map.height}
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="map"
            scale={refraction}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation={scattering} result="scattered" />
          <feColorMatrix in="scattered" type="saturate" values={`${saturation}`} />
        </filter>
      </defs>
    </svg>
  )
}
