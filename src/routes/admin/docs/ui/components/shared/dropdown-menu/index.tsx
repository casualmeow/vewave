import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/dropdown-menu/')({
  component: DropdownMenuSharedUiDocsRoute,
})

function DropdownMenuSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="dropdown-menu" />
}
