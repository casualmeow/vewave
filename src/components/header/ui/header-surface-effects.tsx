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
        <span className="absolute inset-0 bg-[linear-gradient(180deg,var(--glass-highlight),var(--glass-background)_52%,transparent)]" />
        <span className="absolute inset-0 opacity-[var(--header-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--header-pointer-x)_var(--header-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_42%,transparent)_8rem,transparent_13rem)]" />
        <span
          className="absolute inset-0 opacity-45 mix-blend-screen [background:linear-gradient(110deg,transparent_0%,var(--glass-highlight)_20%,transparent_34%,transparent_100%)]"
          style={refractionId ? { filter: `url(#${refractionId})` } : undefined}
        />
        <span className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
        <span className="absolute inset-x-5 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-border),transparent)]" />
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,var(--glass-highlight),transparent_13rem),radial-gradient(circle_at_100%_120%,color-mix(in_srgb,var(--accent)_24%,transparent),transparent_14rem),radial-gradient(circle_at_115%_10%,color-mix(in_srgb,var(--primary)_20%,transparent),transparent_12rem)]" />
      <span className="absolute inset-0 opacity-[var(--header-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--header-pointer-x)_var(--header-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_46%,transparent)_7.5rem,transparent_12rem)]" />
      <span
        className="absolute inset-0 opacity-55 mix-blend-screen [background:radial-gradient(ellipse_at_var(--header-sheen-x)_var(--header-sheen-y),var(--glass-highlight),transparent_26%),linear-gradient(120deg,transparent_0%,var(--glass-highlight)_18%,transparent_34%,transparent_100%)]"
        style={refractionId ? { filter: `url(#${refractionId})` } : undefined}
      />
      <span className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
      <span className="absolute left-4 right-4 top-2 h-9 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_24%,transparent)] blur-2xl" />
      <span className="absolute -left-8 top-1/2 size-20 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] blur-2xl" />
      <span className="absolute -right-10 bottom-0 size-24 rounded-full bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] blur-2xl" />
    </span>
  )
}
