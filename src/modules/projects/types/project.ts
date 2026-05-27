import type { ReactNode } from 'react'
import type { ResizableCardItem } from '@/components/resizable-card'

export type ProjectStatus = 'live' | 'draft' | 'archived'

export type ProjectType = 'watch-room' | 'collection' | 'event'

export type ProjectItem = ResizableCardItem & {
  type: ProjectType
  status: ProjectStatus
  roomCode: string
  members: number
  videos: number
  lastOpened: string
  accent: string
  summary: ReactNode
}
