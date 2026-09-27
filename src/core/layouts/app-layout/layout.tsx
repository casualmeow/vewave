import { Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { AppSidebar } from './ui/app-sidebar'
import { AppShellHeader } from './ui/app-shell-header'
import { useAppShellStore } from './app-shell-store'
import type { AppSidebarMode } from './app-sidebar-mode'
import { cn } from '@/shared/lib/utils'
import { GlassSurface } from '@/shared/ui'
import { AppBackdrop } from '@/components/app-backdrop'
import { GlassInteractionScope } from '@/shared/lib/glass-interaction-scope'

export function AppLayout() {
  const sidebarMode = useAppShellStore((state) => state.sidebarMode)
  const setSidebarMode = useAppShellStore((state) => state.setSidebarMode)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const inRoom = pathname.startsWith('/room/')
  const sidebarModeRef = useRef(sidebarMode)
  sidebarModeRef.current = sidebarMode
  const modeBeforeRoomRef = useRef<AppSidebarMode | null>(null)

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
    <GlassInteractionScope>
      <div className="h-svh overflow-hidden bg-background text-foreground md:h-screen">
        <AppBackdrop paused={inRoom}>
          <div className="relative flex h-full items-start gap-3 p-3 md:p-4">
            <AppSidebar mode={sidebarMode} />
            <GlassSurface
              role="shell"
              backdropSource="scene"
              thickness="thick"
              elevation="embedded"
              className={cn(
                'relative flex h-[calc(100svh-1.5rem)] min-w-0 flex-1 flex-col overflow-hidden md:h-[calc(100vh-2rem)]',
                inRoom ? 'rounded-[2rem] border' : 'rounded-xl border',
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
            </GlassSurface>
          </div>
        </AppBackdrop>
      </div>
    </GlassInteractionScope>
  )
}
