import { Outlet } from '@tanstack/react-router'

import { Header } from './header'
import { StudioSidebar } from './studio-sidebar'
import { StudioSidebarProvider } from '@/components/sidebar'

export function StudioLayout() {
  return (
    <StudioSidebarProvider>
      <div className="min-h-screen bg-sidebar">
        <div className="relative flex h-[100svh] items-start overflow-hidden p-3 md:p-4">
          <StudioSidebar />

          <div className="flex min-h-0 min-w-0 shrink grow flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
            <Header />
            <main className="min-h-0 flex-1 overflow-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] md:px-6 md:py-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </StudioSidebarProvider>
  )
}
