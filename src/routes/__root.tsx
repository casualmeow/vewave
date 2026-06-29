import { Outlet, createRootRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RootProvider as FumadocsRootProvider } from 'fumadocs-ui/provider/tanstack'
import { NotFound } from '@/core/errors'
import { Toaster } from '@/shared/ui'

const RouterDevtools =
  import.meta.env.DEV && import.meta.env.VITE_ROUTER_DEVTOOLS === 'true'
    ? lazy(() =>
        import('@tanstack/react-router-devtools').then((module) => ({
          default: module.TanStackRouterDevtools,
        })),
      )
    : null

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
      {RouterDevtools ? (
        <Suspense fallback={null}>
          <RouterDevtools />
        </Suspense>
      ) : null}
      <Toaster />
    </>
  )
}
