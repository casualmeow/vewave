import { createFileRoute } from '@tanstack/react-router'

import { ResizableCardDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/resizable-card/')({
  component: ResizableCardDocsPage,
})
