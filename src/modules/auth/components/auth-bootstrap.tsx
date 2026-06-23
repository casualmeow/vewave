import { useEffect, useRef, type ReactNode } from 'react'
import { useAuthBootstrap } from '../hooks'
import { useAuthStore } from '../model'
import { getAppearanceSettingsFromAppConfig, useAppearance } from '@/shared/theme'

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  useAuthBootstrap()

  return (
    <>
      <AuthAppearanceSync />
      {children}
    </>
  )
}

function AuthAppearanceSync() {
  const user = useAuthStore((state) => state.user)
  const { setAppearanceSettings } = useAppearance()
  const syncedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      syncedUserIdRef.current = null
      return
    }

    if (syncedUserIdRef.current === user.id) {
      return
    }

    const appearance = getAppearanceSettingsFromAppConfig(user.appConfig)
    syncedUserIdRef.current = user.id

    if (appearance) {
      setAppearanceSettings(appearance)
    }
  }, [setAppearanceSettings, user])

  return null
}
