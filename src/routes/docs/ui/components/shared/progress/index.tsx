import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/progress/')({
  component: ProgressSharedUiDocsRoute,
})

function ProgressSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="progress" />
}
