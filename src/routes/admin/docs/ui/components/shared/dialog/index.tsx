import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/dialog/')({
  component: DialogSharedUiDocsRoute,
})

function DialogSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="dialog" />
}
