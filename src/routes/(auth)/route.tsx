import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
