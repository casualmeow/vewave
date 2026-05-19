import { createFileRoute } from '@tanstack/react-router'
import { RoomPage } from '@/modules/watch-together'

export const Route = createFileRoute('/_app/room/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return <RoomPage code={id} />
}
