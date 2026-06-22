import { createFileRoute } from '@tanstack/react-router'

import { DocsHomePage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/')({
  component: DocsHomePage,
})
