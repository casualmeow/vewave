import { useContext } from 'react'
import { SidebarContext } from '../providers'

export function useSidebarContext() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('Sidebar compound components must be rendered inside <Sidebar>.')
  }

  return context
}
