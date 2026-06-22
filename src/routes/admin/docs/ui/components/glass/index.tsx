import { createFileRoute } from '@tanstack/react-router'

import { GlassDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/glass/')({
  component: GlassDocsPage,
})
