import { create } from 'zustand'
import type { AuthStatus, AuthUser } from './types'

type AuthState = {
  status: AuthStatus
  user: AuthUser | null
  accessToken: string | null
  setAuthenticated: (user: AuthUser, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  setAnonymous: () => void
  setBootstrapping: () => void
  reset: () => void
}

export const initialAuthState = {
  status: 'idle' as AuthStatus,
  user: null,
  accessToken: null,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialAuthState,
  setAuthenticated: (user, accessToken) =>
    set({
      status: 'authenticated',
      user,
      accessToken,
    }),
  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      status: state.user ? 'authenticated' : state.status,
    })),
  setAnonymous: () =>
    set({
      status: 'anonymous',
      user: null,
      accessToken: null,
    }),
  setBootstrapping: () =>
    set({
      status: 'bootstrapping',
    }),
  reset: () => set(initialAuthState),
}))
