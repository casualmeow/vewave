import { createFileRoute } from '@tanstack/react-router'

import { HealthcheckPage } from '@/modules/healthcheck'

export const Route = createFileRoute('/admin/healthcheck/')({
  component: AdminHealthcheckRoute,
})

function AdminHealthcheckRoute() {
  return <HealthcheckPage />
}
