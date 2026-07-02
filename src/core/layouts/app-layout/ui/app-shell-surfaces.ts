import type { ReactNode } from 'react'

export type AppShellSurfaceId =
  | 'sidebar'
  | 'sidebarIdentity'
  | 'sidebarWorkspace'
  | 'sidebarHistory'
  | 'sidebarRooms'
  | 'sidebarServers'
  | 'sidebarFooter'
  | 'header'
  | 'headerSidebarToggle'
  | 'headerTitle'
  | 'headerActions'

export type AppShellSurfaceRenderer = (surface: AppShellSurfaceId, children: ReactNode) => ReactNode
