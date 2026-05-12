import { createFileRoute } from '@tanstack/react-router'
import { StudioLayout } from '@/core/layouts'

export const Route = createFileRoute('/studio')({
  component: StudioLayout,
})
