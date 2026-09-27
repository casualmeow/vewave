import type { PostApiServersByServerIdJoin200ServerRole } from './postApiServersByServerIdJoin200ServerRole.ts'
import type { PostApiServersByServerIdJoin200ServerVisibility } from './postApiServersByServerIdJoin200ServerVisibility.ts'

export type PostApiServersByServerIdJoin200Server = {
  id: string
  name: string
  description: string | null
  visibility: PostApiServersByServerIdJoin200ServerVisibility
  memberCount: number
  roomCount: number
  role:
    | (typeof PostApiServersByServerIdJoin200ServerRole)[keyof typeof PostApiServersByServerIdJoin200ServerRole]
    | null
  createdAt: string
  updatedAt: string
  lastOpenedAt: string | null
}
