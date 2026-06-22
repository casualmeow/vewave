import { createFileRoute } from '@tanstack/react-router'
import { UsersRound } from 'lucide-react'

import { AdminPlaceholderPage } from '@/modules/admin'

export const Route = createFileRoute('/admin/users/')({
  component: AdminUsersRoute,
})

function AdminUsersRoute() {
  return (
    <AdminPlaceholderPage
      title="User management"
      icon={UsersRound}
      description="Admin-only surface for manipulating user accounts, sessions, and privilege assignments."
      operations={[
        {
          label: 'Account lookup',
          description: 'Search users by email, username, or id before applying account actions.',
        },
        {
          label: 'Session controls',
          description: 'Revoke refresh sessions and force users to sign in again.',
        },
        {
          label: 'Privilege changes',
          description: 'Grant or remove admin rights with an auditable backend action.',
        },
      ]}
    />
  )
}
