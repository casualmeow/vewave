import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/input/')({
  component: InputSharedUiDocsRoute,
})

function InputSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="input" />
}
