import { createFileRoute } from '@tanstack/react-router'
import { SignInPage } from '@/modules/auth'

export const Route = createFileRoute('/(auth)/sign-in/')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirectTo: typeof search.redirectTo === 'string' ? search.redirectTo : undefined,
  }),
  component: SignInRoute,
})

function SignInRoute() {
  const { redirectTo } = Route.useSearch()

  return <SignInPage redirectTo={redirectTo} />
}
