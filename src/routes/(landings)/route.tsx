import { createFileRoute } from '@tanstack/react-router'

import { LandingLayout } from '@/core/layouts'

export const Route = createFileRoute('/(landings)')({
  component: LandingLayout,
})
