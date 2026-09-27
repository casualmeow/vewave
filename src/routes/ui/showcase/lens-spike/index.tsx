import { createFileRoute } from '@tanstack/react-router'

import { LensSpikePage } from '@/modules/ui-showcase/lens-spike'

export const Route = createFileRoute('/ui/showcase/lens-spike/')({
  component: LensSpikePage,
})
