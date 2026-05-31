import { useEffect, useRef } from 'react'
import { useAuthStore } from '../model'
import { getApiAuthMe } from '@/core/api/generated/auth/auth'
import { describeApiError } from '@/core/api/http/errors'
import { refreshSessionOnce } from '@/core/api/http/refresh-session'

export function useAuthBootstrap() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setAnonymous = useAuthStore((state) => state.setAnonymous)
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || useAuthStore.getState().status !== 'idle') {
      return
    }

    startedRef.current = true

    async function bootstrap() {
      setBootstrapping()

      try {
        const accessToken = await refreshSessionOnce()

        setAccessToken(accessToken)
        const { user } = await getApiAuthMe()
        setAuthenticated(user, accessToken)
      } catch (error) {
        const description = describeApiError(error, 'Unable to restore session.')

        console.warn('[auth] Session bootstrap failed:', description)
        setAnonymous()
      }
    }

    void bootstrap()
  }, [setAccessToken, setAnonymous, setAuthenticated, setBootstrapping])
}
