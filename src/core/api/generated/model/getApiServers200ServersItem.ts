import type { GetApiServers200ServersItemRole } from './getApiServers200ServersItemRole.ts'
import type { GetApiServers200ServersItemVisibility } from './getApiServers200ServersItemVisibility.ts'

export type GetApiServers200ServersItem = {
  id: string
  name: string
  description: string | null
  visibility: GetApiServers200ServersItemVisibility
  memberCount: number
  roomCount: number
  role:
    | (typeof GetApiServers200ServersItemRole)[keyof typeof GetApiServers200ServersItemRole]
    | null
  createdAt: string
  updatedAt: string
  lastOpenedAt: string | null
}
