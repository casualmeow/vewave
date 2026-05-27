import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/sheet/')({
  component: SheetSharedUiDocsRoute,
})

function SheetSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="sheet" />
}
