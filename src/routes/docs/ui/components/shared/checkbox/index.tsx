import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/checkbox/')({
  component: CheckboxSharedUiDocsRoute,
})

function CheckboxSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="checkbox" />
}
