import { createFileRoute } from '@tanstack/react-router'

import { UiShowcasePage } from '@/modules/ui-showcase'

export const Route = createFileRoute('/ui/showcase/')({
  component: UiShowcasePage,
})
