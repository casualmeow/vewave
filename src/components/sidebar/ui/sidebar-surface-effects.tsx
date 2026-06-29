import type { SidebarDesign, SidebarFilterIds } from '../types'

export function SidebarSurfaceEffects({
  design,
  filterIds,
}: {
  design: SidebarDesign
  filterIds?: SidebarFilterIds
}) {
  if (design === 'solid') {
    return null
  }

  if (design === 'fluent') {
    return (
      <>
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--sidebar-primary),transparent)]" />
        <span className="pointer-events-none absolute inset-y-7 left-0 w-px bg-[linear-gradient(180deg,transparent,var(--sidebar-primary),transparent)]" />
        <span className="pointer-events-none absolute -right-16 top-8 size-40 rounded-full bg-[color-mix(in_srgb,var(--sidebar-primary)_20%,transparent)] blur-3xl" />
      </>
    )
  }

  if (design === 'liquidGlass') {
    return (
      <>
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--glass-highlight)_22%,transparent),transparent_62%)]" />
        <span className="pointer-events-none absolute inset-0 opacity-[var(--sidebar-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--sidebar-pointer-x)_var(--sidebar-pointer-y),color-mix(in_srgb,var(--glass-highlight)_68%,transparent),transparent_12rem)]" />
        <span
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen [background:linear-gradient(120deg,transparent_0%,var(--glass-highlight)_18%,transparent_34%,transparent_100%)]"
          style={filterIds ? { filter: `url(#${filterIds.refraction})` } : undefined}
        />
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
        <span className="pointer-events-none absolute left-6 right-6 top-4 h-20 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_12%,transparent)] blur-2xl" />
      </>
    )
  }

  return (
    <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)] opacity-70" />
  )
}
