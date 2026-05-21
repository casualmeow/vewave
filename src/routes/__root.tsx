import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { RootProvider as FumadocsRootProvider } from 'fumadocs-ui/provider/tanstack'
import { Toaster } from 'sonner'
import { NotFound } from '@/core/errors'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <>
      <FumadocsRootProvider search={{ enabled: false }} theme={{ enabled: false }}>
        <Outlet />
      </FumadocsRootProvider>
      <TanStackRouterDevtools />
      <Toaster />
    </>
  )
}
