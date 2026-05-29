import { createFileRoute } from '@tanstack/react-router'

import { TabsDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/tabs/')({
  component: TabsDocsPage,
})
