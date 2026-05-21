import { createFileRoute } from '@tanstack/react-router'

import { DocsShell } from '@/modules/docs'

export const Route = createFileRoute('/docs')({
  component: DocsShell,
})
