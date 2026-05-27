import { createContext, useContext } from 'react'
import type { SidebarContextValue } from '../types'

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({
  value,
  children,
}: {
  value: SidebarContextValue
  children: React.ReactNode
}) {
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('Sidebar compound components must be rendered inside <SidebarRoot />.')
  }

  return context
}
