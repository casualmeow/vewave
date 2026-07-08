/**
 * MobileDockLiquidEffects
 *
 * Renders the SVG filter definitions (goo + refraction) and the
 * ambient glass overlays (sheen + colour blobs). Isolated from the
 * main dock shell so the JSX tree stays readable.
 */
export function MobileDockLiquidEffects({
  gooFilterId,
  refractionId,
}: {
  gooFilterId: string
  refractionId: string
}) {
  return (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
        <defs>
          <filter id={gooFilterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id={refractionId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.04"
              numOctaves="2"
              seed="9"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Pointer-reactive sheen overlay */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--mobile-dock-pointer-x)_var(--mobile-dock-pointer-y),var(--glass-highlight),transparent_36%),linear-gradient(120deg,transparent,var(--glass-highlight)_var(--mobile-dock-sheen-x),transparent)] opacity-[var(--mobile-dock-glow-opacity)]"
      />

      {/* Ambient colour blobs visible through the refraction filter */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{ filter: `url(#${refractionId})` }}
      >
        <span className="absolute -left-8 top-1/2 size-24 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] blur-xl" />
        <span className="absolute -right-8 bottom-0 size-24 rounded-full bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] blur-xl" />
      </span>
    </>
  )
}
