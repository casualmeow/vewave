import { createFileRoute } from '@tanstack/react-router'

import { ComponentsCatalogPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/')({
  component: ComponentsCatalogPage,
})
