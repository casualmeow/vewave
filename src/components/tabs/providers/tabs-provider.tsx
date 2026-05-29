import { createContext, type ReactNode } from 'react'
import type { TabsContextValue } from '../types'

export const TabsContext = createContext<TabsContextValue | null>(null)

export function TabsProvider({
  value,
  children,
}: {
  value: TabsContextValue
  children: ReactNode
}) {
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}
