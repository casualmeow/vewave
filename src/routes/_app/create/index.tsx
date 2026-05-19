import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '@/modules/auth'
import { CreateRoomPage } from '@/modules/watch-together'

export const Route = createFileRoute('/_app/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RequireAuth>
      <CreateRoomPage />
    </RequireAuth>
  )
}
