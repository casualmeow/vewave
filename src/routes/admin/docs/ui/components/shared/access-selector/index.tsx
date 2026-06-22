import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/access-selector/')({
  component: AccessSelectorSharedUiDocsRoute,
})

function AccessSelectorSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="access-selector" />
}
