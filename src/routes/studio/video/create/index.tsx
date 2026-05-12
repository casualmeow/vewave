import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studio/video/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/studio/video/create/"!</div>
}
