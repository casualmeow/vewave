import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/select/')({
  component: SelectSharedUiDocsRoute,
})

function SelectSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="select" />
}
