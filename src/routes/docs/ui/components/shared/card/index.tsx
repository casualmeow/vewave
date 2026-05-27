import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/card/')({
  component: CardSharedUiDocsRoute,
})

function CardSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="card" />
}
