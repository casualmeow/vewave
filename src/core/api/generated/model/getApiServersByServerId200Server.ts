import type { GetApiServersByServerId200ServerRole } from './getApiServersByServerId200ServerRole.ts'
import type { GetApiServersByServerId200ServerVisibility } from './getApiServersByServerId200ServerVisibility.ts'

export type GetApiServersByServerId200Server = {
  id: string
  name: string
  description: string | null
  visibility: GetApiServersByServerId200ServerVisibility
  memberCount: number
  roomCount: number
  role:
    | (typeof GetApiServersByServerId200ServerRole)[keyof typeof GetApiServersByServerId200ServerRole]
    | null
  createdAt: string
  updatedAt: string
  lastOpenedAt: string | null
}
