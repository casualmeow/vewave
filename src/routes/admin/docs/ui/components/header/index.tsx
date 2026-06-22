import { createFileRoute } from '@tanstack/react-router'

import { HeaderDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/header/')({
  component: HeaderDocsPage,
})
