import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/room/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/room/$id/"!</div>
}
