import { createFileRoute } from '@tanstack/react-router'

import { HelpPage } from '@/modules/help'

export const Route = createFileRoute('/(landings)/help/')({
  component: HelpPage,
})
