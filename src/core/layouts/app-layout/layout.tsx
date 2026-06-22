import { Link, Outlet } from '@tanstack/react-router'
import { Bell, PlusCircle } from 'lucide-react'

import { AppSidebar } from './ui/app-sidebar'
import { Button } from '@/shared/ui'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_28rem),radial-gradient(circle_at_84%_16%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_30rem),linear-gradient(135deg,var(--background),var(--muted)_48%,var(--background))] text-foreground">
      <div className="relative flex h-[100svh] items-start gap-3 p-3 md:h-auto md:min-h-screen md:p-4">
        <AppSidebar />
        <div className="min-h-[calc(100svh-1.5rem)] min-w-0 flex-1 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_28px_90px_color-mix(in_srgb,var(--foreground)_12%,transparent)] backdrop-blur md:min-h-[calc(100vh-2rem)]">
          <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border/70 px-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
                Vewave app
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Watch workspace
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-card/80">
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
