import type { HeaderVariant } from '../types'

function isEnhancedGlassVariant(variant: HeaderVariant) {
  return variant === 'liquidGlass' || variant === 'telegramGlass' || variant === 'glass'
}

export function HeaderSurfaceEffects({
  variant,
  refractionId,
}: {
  variant: HeaderVariant
  refractionId?: string
}) {
  if (!isEnhancedGlassVariant(variant)) return null

  if (variant === 'telegramGlass') {
    return (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.54),rgba(255,255,255,0.14)_52%,rgba(255,255,255,0.08))]" />
        <span className="absolute inset-0 opacity-[var(--header-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--header-pointer-x)_var(--header-pointer-y),rgba(255,255,255,0.92),rgba(255,255,255,0.28)_8rem,transparent_13rem)]" />
        <span
          className="absolute inset-0 opacity-45 mix-blend-screen [background:linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.50)_20%,transparent_34%,transparent_100%)]"
          style={refractionId ? { filter: `url(#${refractionId})` } : undefined}
        />
        <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.72),transparent_13rem),radial-gradient(circle_at_100%_120%,rgba(45,212,191,0.24),transparent_14rem),radial-gradient(circle_at_115%_10%,rgba(125,211,252,0.22),transparent_12rem)]" />
      <span className="absolute inset-0 opacity-[var(--header-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--header-pointer-x)_var(--header-pointer-y),rgba(255,255,255,0.96),rgba(255,255,255,0.34)_7.5rem,transparent_12rem)]" />
      <span
        className="absolute inset-0 opacity-55 mix-blend-screen [background:radial-gradient(ellipse_at_var(--header-sheen-x)_var(--header-sheen-y),rgba(255,255,255,0.58),transparent_26%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.46)_18%,transparent_34%,transparent_100%)]"
        style={refractionId ? { filter: `url(#${refractionId})` } : undefined}
      />
      <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
      <span className="absolute left-4 right-4 top-2 h-9 rounded-full bg-white/20 blur-2xl" />
      <span className="absolute -left-8 top-1/2 size-20 -translate-y-1/2 rounded-full bg-teal-100/16 blur-2xl" />
      <span className="absolute -right-10 bottom-0 size-24 rounded-full bg-sky-100/18 blur-2xl" />
    </span>
  )
}
