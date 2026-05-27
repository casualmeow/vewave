import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/cropper/')({
  component: CropperSharedUiDocsRoute,
})

function CropperSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="cropper" />
}
