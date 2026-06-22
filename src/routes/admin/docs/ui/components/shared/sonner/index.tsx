import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/sonner/')({
  component: SonnerSharedUiDocsRoute,
})

function SonnerSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="sonner" />
}
