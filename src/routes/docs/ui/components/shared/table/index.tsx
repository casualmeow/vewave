import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/table/')({
  component: TableSharedUiDocsRoute,
})

function TableSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="table" />
}
