export type AuthStatus = 'idle' | 'bootstrapping' | 'authenticated' | 'anonymous'

export type AuthUser = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  user: AuthUser
  accessToken: string
}

export type RefreshResponse = {
  accessToken: string
}
