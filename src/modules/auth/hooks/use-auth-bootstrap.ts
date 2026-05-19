import { useEffect, useRef } from 'react'
import { useAuthStore } from '../model'
import { getApiAuthMe } from '@/core/api/generated/auth/auth'
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
    let cancelled = false

    async function bootstrap() {
      setBootstrapping()

      try {
        const accessToken = await refreshSessionOnce()

        if (cancelled) {
          return
        }

        setAccessToken(accessToken)
        const { user } = await getApiAuthMe()

        if (!cancelled) {
          setAuthenticated(user, accessToken)
        }
      } catch {
        if (!cancelled) {
          setAnonymous()
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [setAccessToken, setAnonymous, setAuthenticated, setBootstrapping])
}
