import { Outlet } from '@tanstack/react-router'
import { AppSidebar } from './ui/app-sidebar'
import { RequireAuth } from '@/modules/auth'

export function AppLayout() {
  return (
    <RequireAuth>
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_8%,rgba(45,212,191,0.20),transparent_28rem),radial-gradient(circle_at_78%_16%,rgba(14,165,233,0.16),transparent_26rem),radial-gradient(circle_at_52%_100%,rgba(34,197,94,0.08),transparent_30rem),linear-gradient(135deg,#f8fafc,#eef5f3_48%,#eaf1f8)]">
        <div className="flex min-h-screen items-start gap-4 p-4">
          <AppSidebar />
          <main className="min-h-[calc(100vh-2rem)] min-w-0 flex-1 overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
