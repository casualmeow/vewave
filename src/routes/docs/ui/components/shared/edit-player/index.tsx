import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/edit-player/')({
  component: EditPlayerSharedUiDocsRoute,
})

function EditPlayerSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="edit-player" />
}
