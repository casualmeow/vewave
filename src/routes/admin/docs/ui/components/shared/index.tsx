import { createFileRoute } from '@tanstack/react-router'

import { SharedUiDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/')({
  component: SharedUiDocsPage,
})
