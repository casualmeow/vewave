import { Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { AppSidebar } from './ui/app-sidebar'
import { AppShellHeader } from './ui/app-shell-header'
import { useAppShellStore } from './app-shell-store'
import type { AppSidebarMode } from './app-sidebar-mode'
import { cn } from '@/shared/lib/utils'
import { glassSurfaceVariants } from '@/shared/ui'

export function AppLayout() {
  const sidebarMode = useAppShellStore((state) => state.sidebarMode)
  const setSidebarMode = useAppShellStore((state) => state.setSidebarMode)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const inRoom = pathname.startsWith('/room/')
  const sidebarModeRef = useRef(sidebarMode)
  sidebarModeRef.current = sidebarMode
  const modeBeforeRoomRef = useRef<AppSidebarMode | null>(null)

  // Rooms are video-first: collapse the sidebar on entry, restore on exit.
  // The shell header also hides in rooms; its sidebar toggle re-homes into
  // the room UI (stage overlay / room header).
  useEffect(() => {
    if (inRoom) {
      if (sidebarModeRef.current === 'expanded') {
        modeBeforeRoomRef.current = sidebarModeRef.current
        setSidebarMode('icon')
      }
      return
    }

    if (modeBeforeRoomRef.current) {
      setSidebarMode(modeBeforeRoomRef.current)
      modeBeforeRoomRef.current = null
    }
  }, [inRoom, setSidebarMode])

  return (
    <div className="h-svh overflow-hidden bg-background text-foreground md:h-screen">
      <div aria-hidden data-glass-environment />
      <div className="relative flex h-full items-start gap-3 p-3 md:p-4">
        <AppSidebar mode={sidebarMode} />
        <div
          className={cn(
            'relative flex h-[calc(100svh-1.5rem)] min-w-0 flex-1 flex-col overflow-hidden md:h-[calc(100vh-2rem)]',
            glassSurfaceVariants({
              surface: 'auto',
              role: 'shell',
              thickness: 'thick',
              elevation: 'embedded',
            }),
            inRoom
              ? 'rounded-[2rem] border border-[color:var(--glass-border)]'
              : 'rounded-lg border border-border',
          )}
        >
          {inRoom ? null : (
            <AppShellHeader sidebarMode={sidebarMode} onSidebarModeChange={setSidebarMode} />
          )}
          <main
            data-glass-shell-main
            className={cn('min-h-0 flex-1 overflow-auto', inRoom ? 'p-0' : 'pb-32 md:pb-0')}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
