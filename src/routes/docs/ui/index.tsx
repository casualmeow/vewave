import { createFileRoute } from '@tanstack/react-router'

import { DocsUiPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/')({
  component: DocsUiPage,
})
