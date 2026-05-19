import { useAuthBootstrap } from '../hooks'
import type { ReactNode } from 'react'

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  useAuthBootstrap()

  return children
}
