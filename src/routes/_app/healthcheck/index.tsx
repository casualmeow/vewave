import { createFileRoute } from '@tanstack/react-router'
import { HealthcheckPage } from '@/modules/healthcheck'

export const Route = createFileRoute('/_app/healthcheck/')({
  component: HealthcheckPage,
})
