import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/channel-settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/channel-settings/"!</div>
}
