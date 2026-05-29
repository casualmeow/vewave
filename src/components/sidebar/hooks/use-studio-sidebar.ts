import { useContext } from 'react'
import { StudioSidebarContext } from '../providers'

export function useStudioSidebar() {
  const context = useContext(StudioSidebarContext)

  if (!context) {
    throw new Error('useStudioSidebar must be used inside StudioSidebarProvider')
  }

  return context
}
