import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/core/layouts'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})
