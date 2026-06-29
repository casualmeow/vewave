import { Outlet, useLocation } from '@tanstack/react-router'

import { AppSidebar } from './ui/app-sidebar'
import { AppShellHeader } from './ui/app-shell-header'
import { useAuthStore } from '@/modules/auth'
import { useSavedRooms } from '@/modules/watch-together/room'

export function AppLayout() {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const savedRooms = useSavedRooms(userId)
  const checkingSession = status === 'idle' || status === 'bootstrapping'
  const projectsIndex = location.pathname === '/projects' || location.pathname === '/projects/'
  const firstRunCreationState =
    projectsIndex && status === 'anonymous' && !checkingSession && savedRooms.length === 0

  if (firstRunCreationState) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative flex h-[100svh] items-start gap-3 p-3 md:h-auto md:min-h-screen md:p-4">
        <AppSidebar />
        <div className="min-h-[calc(100svh-1.5rem)] min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm md:min-h-[calc(100vh-2rem)]">
          <AppShellHeader />
          <main className="max-h-[calc(100svh-5.5rem)] overflow-auto pb-32 md:max-h-none md:min-h-[calc(100vh-6rem)] md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
