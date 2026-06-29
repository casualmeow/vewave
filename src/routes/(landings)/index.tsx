import { createFileRoute } from '@tanstack/react-router'

import { LandingIndexPage } from '@/modules/landing'

export const Route = createFileRoute('/(landings)/')({
  component: LandingIndexPage,
})
