import type { PostApiServers200ServerRole } from './postApiServers200ServerRole.ts'
import type { PostApiServers200ServerVisibility } from './postApiServers200ServerVisibility.ts'

export type PostApiServers200Server = {
  id: string
  name: string
  description: string | null
  visibility: PostApiServers200ServerVisibility
  memberCount: number
  roomCount: number
  role: (typeof PostApiServers200ServerRole)[keyof typeof PostApiServers200ServerRole] | null
  createdAt: string
  updatedAt: string
  lastOpenedAt: string | null
}
