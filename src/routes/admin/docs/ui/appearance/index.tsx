import { createFileRoute } from '@tanstack/react-router'

import { AppearanceDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/appearance/')({
  component: AppearanceDocsPage,
})
