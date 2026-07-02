import { createFileRoute } from '@tanstack/react-router'
import { requireAuthRoute } from '@/modules/auth/guards/auth-route'
import { CreateRoomPage } from '@/modules/watch-together'

export const Route = createFileRoute('/_app/create/')({
  beforeLoad: ({ location }) => requireAuthRoute(location),
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateRoomPage />
}
