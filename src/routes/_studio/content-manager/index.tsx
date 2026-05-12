import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_studio/content-manager/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/content-manager/"!</div>
}
