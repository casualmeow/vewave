import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(landings)/studio/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(landings)/studio/"!</div>
}
