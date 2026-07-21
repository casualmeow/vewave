import { PanelLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { getNextAppSidebarMode, type AppSidebarMode } from '../app-sidebar-mode'
import type { ReactNode } from 'react'

import type { AppShellSurfaceRenderer } from './app-shell-surfaces'
import { useLiquidGlassRefraction } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { useAppearance } from '@/shared/theme'

type AppShellHeaderProps = {
  actions?: ReactNode
  eyebrow?: string
  onSidebarModeChange?: (mode: AppSidebarMode) => void
  renderSurface?: AppShellSurfaceRenderer
  sidebarMode?: AppSidebarMode
  title?: string
}

const sidebarModeIcons: Array<{ icon: typeof PanelLeft; mode: AppSidebarMode }> = [
  { mode: 'expanded', icon: PanelLeftOpen },
  { mode: 'icon', icon: PanelLeft },
  { mode: 'hidden', icon: PanelLeftClose },
]

const sidebarModeLabels: Record<AppSidebarMode, string> = {
  expanded: 'Collapse sidebar to icons',
  icon: 'Hide sidebar',
  hidden: 'Show sidebar',
}

export function AppShellHeader({
  actions,
  eyebrow = 'Watch together',
  onSidebarModeChange,
  renderSurface,
  sidebarMode,
  title = 'Rooms',
}: AppShellHeaderProps) {
  const wrapSurface = (surface: Parameters<AppShellSurfaceRenderer>[0], children: ReactNode) =>
    renderSurface ? renderSurface(surface, children) : children
  const { settings } = useAppearance()
  const glassShell = settings.surfaceStyle === 'glass'
  const refraction = useLiquidGlassRefraction({
    enabled: glassShell && settings.experimentalRefraction,
    radius: 0,
    edgeWidth: 16,
    refraction: 18,
    scattering: 6,
  })

  return (
    <header
      ref={refraction.ref}
      data-glass-shell-header
      data-liquid-glass-active={refraction.active || undefined}
      style={refraction.style}
      {...(refraction.active ? refraction.handlers : {})}
      className={cn(
        'flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-border/70 px-5',
        refraction.active && 'glass-material-liquid',
      )}
    >
      {refraction.filterNode}
      <div className="flex min-w-0 items-center gap-3">
        {sidebarMode && onSidebarModeChange
          ? wrapSurface(
              'headerSidebarToggle',
              <button
                type="button"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground outline-none transition-[background-color,color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={sidebarModeLabels[sidebarMode]}
                title={sidebarModeLabels[sidebarMode]}
                onClick={() => onSidebarModeChange(getNextAppSidebarMode(sidebarMode))}
              >
                <span className="relative grid size-4 place-items-center" aria-hidden>
                  {sidebarModeIcons.map(({ mode, icon: Icon }) => (
                    <Icon
                      key={mode}
                      className={cn(
                        'col-start-1 row-start-1 size-4 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                        mode === sidebarMode ? 'scale-100 opacity-100' : 'scale-[0.55] opacity-0',
                      )}
                    />
                  ))}
                </span>
              </button>,
            )
          : null}
        {wrapSurface(
          'headerTitle',
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </div>,
        )}
      </div>
      {actions
        ? wrapSurface('headerActions', <div className="flex items-center gap-2">{actions}</div>)
        : null}
    </header>
  )
}
