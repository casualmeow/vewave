import { PanelLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useAppShellStore } from '@/core/layouts/app-layout/app-shell-store'
import {
  getNextAppSidebarMode,
  type AppSidebarMode,
} from '@/core/layouts/app-layout/app-sidebar-mode'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui'

const sidebarModeIcons: Record<AppSidebarMode, typeof PanelLeft> = {
  expanded: PanelLeftOpen,
  icon: PanelLeft,
  hidden: PanelLeftClose,
}

const sidebarModeLabels: Record<AppSidebarMode, string> = {
  expanded: 'Collapse sidebar to icons',
  icon: 'Hide sidebar',
  hidden: 'Show sidebar',
}

/**
 * The app sidebar toggle re-homed into the room UI — the shell header is
 * hidden on room routes, so this is the only sidebar control there.
 */
export function RoomSidebarToggle({
  variant = 'default',
  style,
}: {
  variant?: 'default' | 'media'
  style?: CSSProperties
}) {
  const sidebarMode = useAppShellStore((state) => state.sidebarMode)
  const setSidebarMode = useAppShellStore((state) => state.setSidebarMode)
  const Icon = sidebarModeIcons[sidebarMode]

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'size-9 shrink-0',
        variant === 'media'
          ? 'text-media-foreground hover:bg-media-control hover:text-media-foreground'
          : 'text-muted-foreground',
      )}
      style={style}
      aria-label={sidebarModeLabels[sidebarMode]}
      title={sidebarModeLabels[sidebarMode]}
      onClick={() => setSidebarMode(getNextAppSidebarMode(sidebarMode))}
    >
      <Icon className="size-4" />
    </Button>
  )
}
