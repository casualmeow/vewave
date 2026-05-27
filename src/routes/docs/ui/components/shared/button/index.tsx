import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/button/')({
  component: ButtonSharedUiDocsRoute,
})

function ButtonSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="button" />
}
