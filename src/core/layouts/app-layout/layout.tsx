import { Link, Outlet } from '@tanstack/react-router'
import { Bell, PlusCircle } from 'lucide-react'

import { AppSidebar } from './ui/app-sidebar'
import { Button } from '@/shared/ui'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,rgba(20,184,166,0.18),transparent_28rem),radial-gradient(circle_at_84%_16%,rgba(14,165,233,0.16),transparent_30rem),linear-gradient(135deg,#f8fafc,#eef5f5_48%,#f8fafc)]">
      <div className="relative flex h-[100svh] items-start gap-3 p-3 md:h-auto md:min-h-screen md:p-4">
        <AppSidebar />
        <div className="min-h-[calc(100svh-1.5rem)] min-w-0 flex-1 overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur md:min-h-[calc(100vh-2rem)]">
          <header className="flex min-h-16 items-center justify-between gap-4 border-b border-zinc-200/70 px-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-700">
                Vewave app
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-950">
                Watch workspace
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white/80">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/create">
                  <PlusCircle className="size-4" />
                  New project
                </Link>
              </Button>
            </div>
          </header>
          <main className="max-h-[calc(100svh-5.5rem)] overflow-auto pb-32 md:max-h-none md:min-h-[calc(100vh-6rem)] md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
