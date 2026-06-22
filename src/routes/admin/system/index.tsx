import { createFileRoute } from '@tanstack/react-router'
import { ServerCog } from 'lucide-react'

import { AdminPlaceholderPage } from '@/modules/admin'

export const Route = createFileRoute('/admin/system/')({
  component: AdminSystemRoute,
})

function AdminSystemRoute() {
  return (
    <AdminPlaceholderPage
      title="System controls"
      icon={ServerCog}
      description="Admin-only surface for operational switches that affect the whole application."
      operations={[
        {
          label: 'Maintenance mode',
          description: 'Prepare a guarded control for temporarily limiting app access.',
        },
        {
          label: 'Background jobs',
          description: 'Inspect job status and retry failed internal tasks.',
        },
        {
          label: 'Service flags',
          description: 'Manage feature gates and integration switches through backend policy.',
        },
      ]}
    />
  )
}
