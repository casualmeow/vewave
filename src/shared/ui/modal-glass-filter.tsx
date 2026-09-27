import type { ModalGlassMaps } from '@/shared/lib/modal-glass'
import type { CSSProperties, RefObject } from 'react'
import type { ResolvedAppearanceMode } from '@/shared/theme/contract'
import { getModalGlassStyle, resolveModalGlassMaterial } from '@/shared/lib/modal-glass'

export type ModalGlassFilterRefs = {
  field: RefObject<SVGFEImageElement | null>
  direction: RefObject<SVGFEFloodElement | null>
  warp: Array<RefObject<SVGFEDisplacementMapElement | null>>
  refraction: Array<RefObject<SVGFEDisplacementMapElement | null>>
}

const alphaFrom = (r: number, g: number, b: number, offset = 0) =>
  `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${r} ${g} ${b} 0 ${offset}`

export function ModalGlassFilter({
  id,
  map,
  refs,
  mode,
}: {
  id: string
  map: ModalGlassMaps
  refs: ModalGlassFilterRefs
  mode: ResolvedAppearanceMode
}) {
  const profile = resolveModalGlassMaterial(mode, map.intensity)
  const region = { x: 0, y: 0, width: map.width, height: map.height }
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      className="pointer-events-none absolute"
      style={getModalGlassStyle(mode, map.intensity) as CSSProperties}
    >
      <defs>
        <filter id={id} {...region} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage
            href={map.displacement}
            {...region}
            preserveAspectRatio="none"
            result="encoded-map"
          />

          <feComponentTransfer in="encoded-map" result="optical-map">
            <feFuncR type="linear" slope={255 / 254} intercept={-1 / 254} />
            <feFuncG type="linear" slope={255 / 254} intercept={-1 / 254} />
          </feComponentTransfer>
          <feImage href={map.mask} {...region} preserveAspectRatio="none" result="material-mask" />
          <feImage
            href={map.heightMap}
            {...region}
            preserveAspectRatio="none"
            result="surface-height"
          />

          <feColorMatrix
            in="material-mask"
            type="matrix"
            values={alphaFrom(1, 0, 0)}
            result="core-mask"
          />
          <feColorMatrix
            in="material-mask"
            type="matrix"
            values={alphaFrom(-1, 0, 0, 1)}
            result="edge-mask"
          />
          <feColorMatrix
            in="material-mask"
            type="matrix"
            values={alphaFrom(0, 1, 0)}
            result="silhouette"
          />
          <feColorMatrix
            in="material-mask"
            type="matrix"
            values={alphaFrom(0, 0, 1)}
            result="rim-mask"
          />
          <feComposite in="core-mask" in2="edge-mask" operator="in" result="shoulder-weight" />
          <feComponentTransfer in="shoulder-weight" result="shoulder-mask">
            <feFuncA type="linear" slope={4} />
          </feComponentTransfer>
          <feFlood floodColor="rgb(50% 50% 50%)" result="neutral-warp" />
          <feImage
            ref={refs.field}
            href={map.pointerField}
            x={-192}
            y={-192}
            width={192}
            height={192}
            preserveAspectRatio="none"
            result="pointer-field"
          />
          <feComposite
            in="pointer-field"
            in2="shoulder-mask"
            operator="in"
            result="shoulder-field"
          />
          <feFlood ref={refs.direction} floodColor="rgb(50% 0% 50%)" result="warp-direction" />
          <feComposite in="warp-direction" in2="shoulder-field" operator="in" result="local-warp" />
          <feComposite in="local-warp" in2="neutral-warp" operator="over" result="warp" />
          {['optical-map', 'surface-height'].map((input, index) => (
            <feDisplacementMap
              key={input}
              ref={refs.warp[index]}
              in={input}
              in2="warp"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
              result={`bent-${input}`}
            />
          ))}

          {[0.25, 0, -0.25].map((dispersion, index) => (
            <feDisplacementMap
              key={index}
              ref={refs.refraction[index]}
              in="SourceGraphic"
              in2="bent-optical-map"
              scale={2 * (profile.displacement - 0.25 + dispersion)}
              xChannelSelector="R"
              yChannelSelector="G"
              result={`refracted-${index}`}
            />
          ))}
          <feColorMatrix
            in="refracted-0"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="red"
          />
          <feColorMatrix
            in="refracted-1"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="green"
          />
          <feColorMatrix
            in="refracted-2"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="blue"
          />
          <feComposite
            in="red"
            in2="green"
            operator="arithmetic"
            k2={1}
            k3={1}
            result="red-green"
          />
          <feComposite
            in="red-green"
            in2="blue"
            operator="arithmetic"
            k2={1}
            k3={1}
            result="refracted"
          />
          <feGaussianBlur in="refracted" stdDeviation={profile.edgeBlur} result="clear-edge" />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={profile.centerBlur}
            result="frosted-center"
          />
          <feComposite in="clear-edge" in2="edge-mask" operator="in" result="edge" />
          <feComposite in="frosted-center" in2="core-mask" operator="in" result="core" />

          <feComposite in="edge" in2="core" operator="arithmetic" k2={1} k3={1} result="optics" />
          <feFlood floodColor="var(--popover)" floodOpacity={profile.edgeTint} result="edge-tint" />
          <feComposite in="edge-tint" in2="optics" operator="over" result="tinted-edge" />

          <feFlood
            floodColor="var(--popover)"
            floodOpacity={profile.coreTint}
            result="center-tint"
          />

          <feComponentTransfer in="core-mask" result="tint-mask">
            <feFuncA type="linear" slope={profile.tintCoreScale} />
          </feComponentTransfer>
          <feComposite in="center-tint" in2="tint-mask" operator="in" result="weighted-tint" />
          <feComposite in="weighted-tint" in2="tinted-edge" operator="over" result="body" />

          <feSpecularLighting
            in="bent-surface-height"
            surfaceScale={profile.bevel}
            specularConstant={0.6}
            specularExponent={24}
            lightingColor="#fff"
            result="surface-light"
          >
            <feDistantLight azimuth={225} elevation={55} />
          </feSpecularLighting>
          <feComposite in="surface-light" in2="rim-mask" operator="in" result="rim-light" />
          <feComposite in="rim-light" in2="body" operator="over" result="lit-glass" />
          <feComposite in="lit-glass" in2="silhouette" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
