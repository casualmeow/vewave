import { createFileRoute } from '@tanstack/react-router'

import { ForumHomePage } from '@/modules/community'

export const Route = createFileRoute('/(landings)/community/')({
  component: ForumHomePage,
})
