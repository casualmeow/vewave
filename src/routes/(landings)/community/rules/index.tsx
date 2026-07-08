import { createFileRoute } from '@tanstack/react-router'

import { ForumRulesPage } from '@/modules/community'

export const Route = createFileRoute('/(landings)/community/rules/')({
  component: ForumRulesPage,
})
