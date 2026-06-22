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
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,var(--glass-highlight),transparent_16rem),radial-gradient(circle_at_110%_22%,color-mix(in_srgb,var(--primary)_24%,transparent),transparent_15rem),radial-gradient(circle_at_0%_82%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_16rem)]" />
        <span className="pointer-events-none absolute inset-0 opacity-[var(--sidebar-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--sidebar-pointer-x)_var(--sidebar-pointer-y),var(--glass-highlight),color-mix(in_srgb,var(--glass-highlight)_46%,transparent)_9rem,transparent_14rem)]" />
        <span
          className="pointer-events-none absolute inset-0 opacity-55 mix-blend-screen [background:radial-gradient(ellipse_at_var(--sidebar-glass-sheen-x)_var(--sidebar-glass-sheen-y),var(--glass-highlight),transparent_28%),linear-gradient(120deg,transparent_0%,var(--glass-highlight)_18%,transparent_32%,transparent_100%)]"
          style={filterIds ? { filter: `url(#${filterIds.refraction})` } : undefined}
        />
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
        <span className="pointer-events-none absolute inset-y-7 left-0 w-px bg-[linear-gradient(180deg,transparent,var(--glass-highlight),transparent)]" />
        <span className="pointer-events-none absolute inset-y-8 right-0 w-px bg-[linear-gradient(180deg,transparent,var(--accent),transparent)]" />
        <span className="pointer-events-none absolute left-6 right-6 top-4 h-28 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_22%,transparent)] blur-2xl" />
        <span className="pointer-events-none absolute -left-20 top-16 size-44 rounded-full bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] blur-3xl" />
        <span className="pointer-events-none absolute -right-20 bottom-16 size-48 rounded-full bg-[color-mix(in_srgb,var(--primary)_22%,transparent)] blur-3xl" />
        <span className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,var(--glass-highlight)_18%,transparent_34%,transparent_100%)]" />
      </>
    )
  }

  return (
    <>
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--glass-highlight),transparent)]" />
      <span className="pointer-events-none absolute left-4 right-4 top-3 h-20 rounded-full bg-[color-mix(in_srgb,var(--glass-highlight)_22%,transparent)] blur-2xl" />
      <span className="pointer-events-none absolute -left-16 bottom-10 size-36 rounded-full bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] blur-3xl" />
    </>
  )
}
