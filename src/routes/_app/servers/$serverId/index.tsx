import { createFileRoute } from '@tanstack/react-router'
import { requireAuthRoute } from '@/modules/auth/guards/auth-route'
import { ServerPage } from '@/modules/servers'

export const Route = createFileRoute('/_app/servers/$serverId/')({
  beforeLoad: ({ location }) => requireAuthRoute(location),
  component: RouteComponent,
})

function RouteComponent() {
  const { serverId } = Route.useParams()

  return <ServerPage serverId={serverId} />
}
