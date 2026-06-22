import { Outlet } from '@tanstack/react-router'

import { LandingHeader } from './landing-header'
import { HeaderSpacer } from '@/components/header'

export function LandingLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-foreground text-background">
      <LandingHeader />
      <HeaderSpacer size="lg" topOffset={16} extraOffset={28} />

      <main className="relative">
        <Outlet />
      </main>
    </div>
  )
}
