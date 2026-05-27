import { Outlet } from '@tanstack/react-router'
import { Header } from './header'
import { StudioSidebar } from './studio-sidebar'

export function StudioLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(45,212,191,0.18),transparent_30rem),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.14),transparent_26rem),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_28rem),linear-gradient(135deg,#f8fafc,#eef2f7)]">
      <div className="flex items-start p-4">
        <StudioSidebar />
        <div className="min-h-[calc(100vh-32px)] min-w-0 shrink grow rounded-2xl border bg-background/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
