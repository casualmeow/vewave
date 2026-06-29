import type { ReactNode } from 'react'
import type { ResizableCardItem } from '@/components/resizable-card'

export type RoomWorkspaceStatus = 'setup' | 'live' | 'archived'

export type RoomWorkspaceType = 'watch-room'

export type RoomWorkspaceItem = ResizableCardItem & {
  type: RoomWorkspaceType
  status: RoomWorkspaceStatus
  roomCode: string
  members: number
  videos: number
  thumbnailUrls?: Array<string>
  lastOpened: string
  accent: string
  summary: ReactNode
}

export type ProjectStatus = RoomWorkspaceStatus
export type ProjectType = RoomWorkspaceType
export type ProjectItem = RoomWorkspaceItem
