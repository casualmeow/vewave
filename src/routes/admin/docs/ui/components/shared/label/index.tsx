import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/label/')({
  component: LabelSharedUiDocsRoute,
})

function LabelSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="label" />
}
