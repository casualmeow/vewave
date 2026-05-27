import { createFileRoute } from '@tanstack/react-router'

import { SidebarDocsPage } from '@/modules/docs'

export const Route = createFileRoute('/docs/ui/components/sidebar/')({
  component: SidebarDocsPage,
})
