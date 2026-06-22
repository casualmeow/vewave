import { redirect } from '@tanstack/react-router'
import { getApiAuthMe } from '@/core/api/generated/auth/auth'
import { refreshSessionOnce } from '@/core/api/http/refresh-session'
import { useAuthStore } from '@/modules/auth/model'

type GuardLocation = {
  href: string
}

const getSignInRedirect = (location: GuardLocation) =>
  redirect({
    to: '/sign-in',
    search: {
      redirectTo: location.href,
    },
  })

export async function requireAdminRoute(location: GuardLocation) {
  const status = useAuthStore.getState().status
  let { accessToken, user } = useAuthStore.getState()

  if (status !== 'authenticated' || !user) {
    try {
      useAuthStore.getState().setBootstrapping()
      accessToken = accessToken ?? (await refreshSessionOnce())
      useAuthStore.getState().setAccessToken(accessToken)

      const response = await getApiAuthMe()
      user = response.user
      useAuthStore.getState().setAuthenticated(user, accessToken)
    } catch {
      useAuthStore.getState().setAnonymous()
      throw getSignInRedirect(location)
    }
  }

  if (!user.isAdmin) {
    throw redirect({ to: '/projects' })
  }

  return { adminUser: user }
}
