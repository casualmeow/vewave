import { Outlet } from '@tanstack/react-router'

import { Header } from './header'
import { StudioSidebar } from './studio-sidebar'
import { StudioSidebarProvider } from '@/components/sidebar'
import { AppBackdrop } from '@/components/app-backdrop'
import { GlassSurface } from '@/shared/ui'
import { GlassInteractionScope } from '@/shared/lib/glass-interaction-scope'

export function StudioLayout() {
  return (
    <GlassInteractionScope>
      <StudioSidebarProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AppBackdrop>
            <div className="relative flex h-[100svh] items-start overflow-hidden p-3 md:p-4">
              <StudioSidebar />

              <GlassSurface
                role="shell"
                backdropSource="scene"
                thickness="thick"
                elevation="embedded"
                className="flex h-full min-h-0 min-w-0 shrink grow flex-col overflow-hidden rounded-xl border"
              >
                <Header />
                <main className="min-h-0 flex-1 overflow-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] md:px-6 md:py-6">
                  <Outlet />
                </main>
              </GlassSurface>
            </div>
          </AppBackdrop>
        </div>
      </StudioSidebarProvider>
    </GlassInteractionScope>
  )
}
