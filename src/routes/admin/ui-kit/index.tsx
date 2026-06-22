import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/ui-kit/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/docs/ui/components' })
  },
})
