import { createFileRoute } from '@tanstack/react-router'

import { AdminLayout } from '@/modules/admin'
import { requireAdminRoute } from '@/modules/auth/guards/admin-route'

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ location }) => requireAdminRoute(location),
  component: AdminRoute,
})

function AdminRoute() {
  const { adminUser } = Route.useRouteContext()

  return <AdminLayout adminUser={adminUser} />
}
