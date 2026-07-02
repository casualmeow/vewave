import { Outlet } from '@tanstack/react-router'
import { useState } from 'react'

import { AppSidebar } from './ui/app-sidebar'
import { AppShellHeader } from './ui/app-shell-header'
import type { AppSidebarMode } from './app-sidebar-mode'

export function AppLayout() {
  const [sidebarMode, setSidebarMode] = useState<AppSidebarMode>('expanded')

  return (
    <div className="h-svh overflow-hidden bg-background text-foreground md:h-screen">
      <div className="relative flex h-full items-start gap-3 p-3 md:p-4">
        <AppSidebar mode={sidebarMode} />
        <div className="flex h-[calc(100svh-1.5rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm md:h-[calc(100vh-2rem)]">
          <AppShellHeader sidebarMode={sidebarMode} onSidebarModeChange={setSidebarMode} />
          <main className="min-h-0 flex-1 overflow-auto pb-32 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
