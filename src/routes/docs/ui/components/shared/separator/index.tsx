import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/separator/')({
  component: SeparatorSharedUiDocsRoute,
})

function SeparatorSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="separator" />
}
