import { createFileRoute } from '@tanstack/react-router'

import { AdminDashboardPage } from '@/modules/admin'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  return <AdminDashboardPage />
}
