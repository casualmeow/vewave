import type { GlassFilterIds } from '@/components/glass'
import type { TabsDesign } from '../types'

export function TabsSurfaceEffects({
  design,
  filterIds,
}: {
  design: TabsDesign
  filterIds?: GlassFilterIds
}) {
  if (design === 'solid') return null

  if (design === 'telegramGlass') {
    return (
      <>
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,var(--glass-highlight),var(--glass-background))]" />
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--tabs-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--tabs-pointer-x)_var(--tabs-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_38%,transparent)_7rem,transparent_12rem)]" />
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-45 mix-blend-screen [background:linear-gradient(110deg,transparent_0%,var(--glass-highlight)_22%,transparent_36%,transparent_100%)]"
          style={filterIds ? { filter: `url(#${filterIds.refraction})` } : undefined}
        />
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
        <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-border),transparent)]" />
      </>
    )
  }

  return (
    <>
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_16%_6%,var(--glass-highlight),transparent_12rem),radial-gradient(circle_at_112%_12%,color-mix(in_srgb,var(--primary)_22%,transparent),transparent_12rem),radial-gradient(circle_at_0%_90%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_13rem)]" />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--tabs-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--tabs-pointer-x)_var(--tabs-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_42%,transparent)_8rem,transparent_13rem)]" />
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-55 mix-blend-screen [background:radial-gradient(ellipse_at_var(--tabs-sheen-x)_var(--tabs-sheen-y),var(--glass-highlight),transparent_28%),linear-gradient(120deg,transparent_0%,var(--glass-highlight)_18%,transparent_34%,transparent_100%)]"
        style={filterIds ? { filter: `url(#${filterIds.refraction})` } : undefined}
      />
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
      <span className="pointer-events-none absolute left-4 right-4 top-2 h-12 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_22%,transparent)] blur-2xl" />
      <span className="pointer-events-none absolute -left-10 top-1/2 size-24 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] blur-2xl" />
      <span className="pointer-events-none absolute -right-10 bottom-0 size-24 rounded-full bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] blur-2xl" />
    </>
  )
}
