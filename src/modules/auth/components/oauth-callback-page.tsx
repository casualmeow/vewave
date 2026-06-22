import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../model'
import { getApiAuthMe } from '@/core/api/generated/auth/auth'
import { describeApiError } from '@/core/api/http/errors'
import { refreshSessionOnce } from '@/core/api/http/refresh-session'

const defaultRedirectPath = '/projects'

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return defaultRedirectPath
  }

  return value
}

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setAnonymous = useAuthStore((state) => state.setAnonymous)
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) {
      return
    }

    startedRef.current = true

    async function completeOAuth() {
      const search = new URLSearchParams(window.location.search)
      const oauthError = search.get('oauthError')
      const oauthErrorDescription = search.get('oauthErrorDescription')

      if (oauthError) {
        toast.error('OAuth sign-in failed', {
          description: oauthErrorDescription ?? oauthError,
        })
        setAnonymous()
        await navigate({ to: '/sign-in', search: { redirectTo: undefined } })
        return
      }

      setBootstrapping()

      try {
        const accessToken = await refreshSessionOnce()

        setAccessToken(accessToken)
        const { user } = await getApiAuthMe()
        setAuthenticated(user, accessToken)

        const redirectTo = getSafeRedirectPath(search.get('redirectTo'))

        if (redirectTo === defaultRedirectPath) {
          await navigate({ to: '/projects' })
          return
        }

        window.location.replace(redirectTo)
      } catch (error) {
        const description = describeApiError(error, 'Unable to complete OAuth sign-in.')

        toast.error(description.title, {
          description: description.message,
        })
        setAnonymous()
        await navigate({ to: '/sign-in', search: { redirectTo: undefined } })
      }
    }

    void completeOAuth()
  }, [navigate, setAccessToken, setAnonymous, setAuthenticated, setBootstrapping])

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        Signing you in...
      </div>
    </main>
  )
}
