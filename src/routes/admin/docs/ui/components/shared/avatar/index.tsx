import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/admin/docs/ui/components/shared/avatar/')({
  component: AvatarSharedUiDocsRoute,
})

function AvatarSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="avatar" />
}
