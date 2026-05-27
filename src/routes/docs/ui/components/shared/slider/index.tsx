import { createFileRoute } from '@tanstack/react-router'

import { SharedUiComponentDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/shared/slider/')({
  component: SliderSharedUiDocsRoute,
})

function SliderSharedUiDocsRoute() {
  return <SharedUiComponentDocsPage slug="slider" />
}
