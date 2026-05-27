import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/form/')({
  component: FormSharedUiDocsRoute,
})

function FormSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="form" />
}
