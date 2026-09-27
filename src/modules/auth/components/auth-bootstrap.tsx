import { useEffect, type ReactNode } from 'react'
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
  const status = useAuthStore((state) => state.status)
  const { bindAppearanceAccount } = useAppearance()

  useEffect(() => {
    if (status !== 'authenticated' && status !== 'anonymous') return
    bindAppearanceAccount(user?.id ?? null, getAppearanceSettingsFromAppConfig(user?.appConfig))
  }, [bindAppearanceAccount, status, user])

  return null
}
