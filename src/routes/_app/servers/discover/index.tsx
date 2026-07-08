import { createFileRoute } from '@tanstack/react-router'
import { requireAuthRoute } from '@/modules/auth/guards/auth-route'
import { ServersDiscoverPage } from '@/modules/servers-discover'

export const Route = createFileRoute('/_app/servers/discover/')({
  beforeLoad: ({ location }) => requireAuthRoute(location),
  component: ServersDiscoverPage,
})
