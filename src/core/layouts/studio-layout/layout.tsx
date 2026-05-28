import { useState } from 'react'
import { Outlet } from '@tanstack/react-router'

import { Header } from './header'
import { StudioSidebar } from './studio-sidebar'

export function StudioLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_12%_8%,rgba(45,212,191,0.18),transparent_30rem),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.14),transparent_26rem),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.08),transparent_28rem),linear-gradient(135deg,#f8fafc,#eef2f7)]">
      <div className="relative isolate flex h-[100svh] items-start overflow-hidden p-3 pb-28 md:h-auto md:min-h-screen md:overflow-visible md:p-4">
        <StudioSidebar className={sidebarVisible ? undefined : 'md:hidden'} />

        <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:min-h-[calc(100vh-2rem)]">
          <Header
            sidebarVisible={sidebarVisible}
            onSidebarVisibilityChange={() => setSidebarVisible((visible) => !visible)}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-32 md:p-6 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
