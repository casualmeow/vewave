import type { ReactNode } from 'react'

import type { AppShellSurfaceRenderer } from './app-shell-surfaces'

type AppShellHeaderProps = {
  actions?: ReactNode
  eyebrow?: string
  renderSurface?: AppShellSurfaceRenderer
  title?: string
}

export function AppShellHeader({
  actions,
  eyebrow = 'Watch together',
  renderSurface,
  title = 'Rooms',
}: AppShellHeaderProps) {
  const wrapSurface = (surface: Parameters<AppShellSurfaceRenderer>[0], children: ReactNode) =>
    renderSurface ? renderSurface(surface, children) : children

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border/70 px-5">
      {wrapSurface(
        'headerTitle',
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        </div>,
      )}
      {actions
        ? wrapSurface('headerActions', <div className="flex items-center gap-2">{actions}</div>)
        : null}
    </header>
  )
}
