import { redirect } from '@tanstack/react-router'
import { getApiAuthMe } from '@/core/api/generated/auth/auth'
import { refreshSessionOnce } from '@/core/api/http/refresh-session'
import { useAuthStore } from '@/modules/auth/model'

export type AuthGuardLocation = {
  href: string
}

const getSignInRedirect = (location: AuthGuardLocation) =>
  redirect({
    to: '/sign-in',
    search: {
      redirectTo: location.href,
    },
  })

export async function requireAuthRoute(location: AuthGuardLocation) {
  const status = useAuthStore.getState().status
  let { accessToken, user } = useAuthStore.getState()

  if (status === 'authenticated' && user) {
    return { user }
  }

  try {
    useAuthStore.getState().setBootstrapping()
    accessToken = accessToken ?? (await refreshSessionOnce())
    useAuthStore.getState().setAccessToken(accessToken)

    const response = await getApiAuthMe()
    user = response.user
    useAuthStore.getState().setAuthenticated(user, accessToken)

    return { user }
  } catch {
    useAuthStore.getState().setAnonymous()
    throw getSignInRedirect(location)
  }
}
