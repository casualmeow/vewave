import { createFileRoute } from '@tanstack/react-router'
import { Database } from 'lucide-react'

import { AdminPlaceholderPage } from '@/modules/admin'

export const Route = createFileRoute('/admin/database/')({
  component: AdminDatabaseRoute,
})

function AdminDatabaseRoute() {
  return (
    <AdminPlaceholderPage
      title="Database tools"
      icon={Database}
      description="Admin-only surface for database visibility and controlled operational tasks."
      operations={[
        {
          label: 'Schema status',
          description: 'Display current Drizzle migration state and pending migration warnings.',
        },
        {
          label: 'Data inspection',
          description: 'Inspect selected tables through narrowly scoped read-only views.',
        },
        {
          label: 'Backup actions',
          description: 'Trigger or verify backups once the backend exposes explicit controls.',
        },
      ]}
    />
  )
}
