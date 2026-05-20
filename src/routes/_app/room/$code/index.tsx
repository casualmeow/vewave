import { createFileRoute } from '@tanstack/react-router'
import { RoomPage } from '@/modules/watch-together'

export const Route = createFileRoute('/_app/room/$code/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { code } = Route.useParams()

  return <RoomPage code={code} />
}
