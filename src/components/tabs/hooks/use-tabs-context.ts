import { useContext } from 'react'
import { TabsContext } from '../providers'
import type { TabsContextValue } from '../types'

export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error('Tabs components must be used inside <Tabs>.')
  }

  return context
}
