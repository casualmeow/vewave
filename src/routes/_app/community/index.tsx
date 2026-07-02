import { createFileRoute } from '@tanstack/react-router'
import { requireAuthRoute } from '@/modules/auth/guards/auth-route'
import { CommunityPage } from '@/modules/community'

export const Route = createFileRoute('/_app/community/')({
  beforeLoad: ({ location }) => requireAuthRoute(location),
  component: CommunityPage,
})
