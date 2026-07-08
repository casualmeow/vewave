import type { HeaderVariant } from '../types'

/**
 * Renders the SVG filter definitions used for glass refraction effects.
 * Keeping this isolated prevents cluttering the main header JSX with DOM-only boilerplate.
 */
export function HeaderRefractionFilter({ id, variant }: { id: string; variant: HeaderVariant }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={variant === 'telegramGlass' ? '0.01 0.026' : '0.012 0.034'}
            numOctaves="2"
            seed="13"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={variant === 'telegramGlass' ? '7' : '10'}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
