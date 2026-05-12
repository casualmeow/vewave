import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studio/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/studio/home/"!</div>
}
