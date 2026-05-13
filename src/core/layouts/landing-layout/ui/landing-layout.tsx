import { Outlet } from '@tanstack/react-router'

import { LandingHeader } from './landing-header'
import { HeaderSpacer } from '@/shared/ui/header'

export function LandingLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <LandingHeader />
      <HeaderSpacer size="lg" topOffset={16} extraOffset={28} />

      <main className="relative">
        <Outlet />
      </main>
    </div>
  )
}
