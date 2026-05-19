import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../model'

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const navigate = useNavigate()
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    if (status === 'anonymous') {
      void navigate({ to: '/login' })
    }
  }, [navigate, status])

  if (status === 'idle' || status === 'bootstrapping') {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-sm text-muted-foreground">
        Checking your session...
      </main>
    )
  }

  if (status === 'anonymous') {
    return null
  }

  return children
}
