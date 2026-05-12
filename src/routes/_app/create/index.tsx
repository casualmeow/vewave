import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/create/"!</div>
}
