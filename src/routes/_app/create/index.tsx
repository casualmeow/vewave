import { createFileRoute } from '@tanstack/react-router'
import { CreateRoomPage } from '@/modules/watch-together'

export const Route = createFileRoute('/_app/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateRoomPage />
}
