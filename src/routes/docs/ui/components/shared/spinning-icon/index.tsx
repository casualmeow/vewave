import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/spinning-icon/')({
  component: SpinningIconSharedUiDocsRoute,
})

function SpinningIconSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="spinning-icon" />
}
