import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studio/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/analytics/"!</div>
}
