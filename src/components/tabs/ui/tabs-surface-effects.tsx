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
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.46),rgba(255,255,255,0.10))]" />
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--tabs-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--tabs-pointer-x)_var(--tabs-pointer-y),rgba(255,255,255,0.86),rgba(255,255,255,0.24)_7rem,transparent_12rem)]" />
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-45 mix-blend-screen [background:linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.46)_22%,transparent_36%,transparent_100%)]"
          style={filterIds ? { filter: `url(#${filterIds.refraction})` } : undefined}
        />
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </>
    )
  }

  return (
    <>
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_16%_6%,rgba(255,255,255,0.70),transparent_12rem),radial-gradient(circle_at_112%_12%,rgba(125,211,252,0.26),transparent_12rem),radial-gradient(circle_at_0%_90%,rgba(45,212,191,0.22),transparent_13rem)]" />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--tabs-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--tabs-pointer-x)_var(--tabs-pointer-y),rgba(255,255,255,0.96),rgba(255,255,255,0.32)_8rem,transparent_13rem)]" />
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-55 mix-blend-screen [background:radial-gradient(ellipse_at_var(--tabs-sheen-x)_var(--tabs-sheen-y),rgba(255,255,255,0.56),transparent_28%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.44)_18%,transparent_34%,transparent_100%)]"
        style={filterIds ? { filter: `url(#${filterIds.refraction})` } : undefined}
      />
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
      <span className="pointer-events-none absolute left-4 right-4 top-2 h-12 rounded-full bg-white/18 blur-2xl" />
      <span className="pointer-events-none absolute -left-10 top-1/2 size-24 -translate-y-1/2 rounded-full bg-teal-100/14 blur-2xl" />
      <span className="pointer-events-none absolute -right-10 bottom-0 size-24 rounded-full bg-sky-100/16 blur-2xl" />
    </>
  )
}
