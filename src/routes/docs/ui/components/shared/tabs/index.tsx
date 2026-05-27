import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/tabs/')({
  component: TabsSharedUiDocsRoute,
})

function TabsSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="tabs" />
}
