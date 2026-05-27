import type { SidebarDesign } from '../types'

export function SidebarSurfaceEffects({ design }: { design: SidebarDesign }) {
  if (design === 'solid') {
    return null
  }

  if (design === 'fluent') {
    return (
      <>
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        <span className="pointer-events-none absolute inset-y-7 left-0 w-px bg-gradient-to-b from-transparent via-sky-300/65 to-transparent" />
        <span className="pointer-events-none absolute -right-16 top-8 size-40 rounded-full bg-sky-200/20 blur-3xl" />
      </>
    )
  }

  if (design === 'liquidGlass') {
    return (
      <>
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.70),transparent_16rem),radial-gradient(circle_at_110%_22%,rgba(125,211,252,0.32),transparent_15rem),radial-gradient(circle_at_0%_82%,rgba(45,212,191,0.28),transparent_16rem)]" />
        <span className="pointer-events-none absolute inset-0 opacity-[var(--sidebar-glass-spot-opacity)] transition-opacity duration-150 [background:radial-gradient(circle_at_var(--sidebar-pointer-x)_var(--sidebar-pointer-y),rgba(255,255,255,0.95),rgba(255,255,255,0.36)_9rem,transparent_14rem)]" />
        <span className="pointer-events-none absolute inset-0 opacity-55 mix-blend-screen [filter:url(#vewave-sidebar-refraction)] [background:radial-gradient(ellipse_at_var(--sidebar-glass-sheen-x)_var(--sidebar-glass-sheen-y),rgba(255,255,255,0.55),transparent_28%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.42)_18%,transparent_32%,transparent_100%)]" />
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
        <span className="pointer-events-none absolute inset-y-7 left-0 w-px bg-gradient-to-b from-transparent via-white/75 to-transparent" />
        <span className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-teal-100/55 to-transparent" />
        <span className="pointer-events-none absolute left-6 right-6 top-4 h-28 rounded-full bg-white/18 blur-2xl" />
        <span className="pointer-events-none absolute -left-20 top-16 size-44 rounded-full bg-teal-200/24 blur-3xl" />
        <span className="pointer-events-none absolute -right-20 bottom-16 size-48 rounded-full bg-sky-200/26 blur-3xl" />
        <span className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.42)_18%,transparent_34%,transparent_100%)]" />
      </>
    )
  }

  return (
    <>
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      <span className="pointer-events-none absolute left-4 right-4 top-3 h-20 rounded-full bg-white/20 blur-2xl" />
      <span className="pointer-events-none absolute -left-16 bottom-10 size-36 rounded-full bg-teal-200/25 blur-3xl" />
    </>
  )
}
