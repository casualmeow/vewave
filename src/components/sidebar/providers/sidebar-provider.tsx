import { createContext, type ReactNode } from 'react'
import type { SidebarContextValue } from '../types'

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({
  children,
  value,
}: {
  children: ReactNode
  value: SidebarContextValue
}) {
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}
