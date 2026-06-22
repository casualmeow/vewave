import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/tooltip/')({
  component: TooltipSharedUiDocsRoute,
})

function TooltipSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="tooltip" />
}
