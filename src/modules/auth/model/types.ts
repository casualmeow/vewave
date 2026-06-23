import type { UserAppConfig } from '@/shared/theme'

export type AuthStatus = 'idle' | 'bootstrapping' | 'authenticated' | 'anonymous'

export type AuthUser = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig?: UserAppConfig
}

export type AuthResponse = {
  user: AuthUser
  accessToken: string
}

export type RefreshResponse = {
  accessToken: string
}
