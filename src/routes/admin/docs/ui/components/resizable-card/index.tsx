import { createFileRoute } from '@tanstack/react-router'

import { ResizableCardDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/resizable-card/')({
  component: ResizableCardDocsPage,
})
