import { createFileRoute } from '@tanstack/react-router'
import { requireAuthRoute } from '@/modules/auth/guards/auth-route'
import { RoomPage } from '@/modules/watch-together'

export const Route = createFileRoute('/_app/room/$code/')({
  beforeLoad: ({ location }) => requireAuthRoute(location),
  component: RouteComponent,
})

function RouteComponent() {
  const { code } = Route.useParams()

  return <RoomPage code={code} />
}
