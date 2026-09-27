import type { GetApiServersCommunity200ServersItemRole } from './getApiServersCommunity200ServersItemRole.ts'
import type { GetApiServersCommunity200ServersItemVisibility } from './getApiServersCommunity200ServersItemVisibility.ts'

export type GetApiServersCommunity200ServersItem = {
  id: string
  name: string
  description: string | null
  visibility: GetApiServersCommunity200ServersItemVisibility
  memberCount: number
  roomCount: number
  role:
    | (typeof GetApiServersCommunity200ServersItemRole)[keyof typeof GetApiServersCommunity200ServersItemRole]
    | null
  createdAt: string
  updatedAt: string
  lastOpenedAt: string | null
}
