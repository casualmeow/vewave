import { createFileRoute } from '@tanstack/react-router'

import { DocsUiPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/')({
  component: DocsUiPage,
})
