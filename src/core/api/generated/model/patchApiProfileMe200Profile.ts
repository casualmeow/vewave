import type { PatchApiProfileMe200ProfileAppConfig } from './patchApiProfileMe200ProfileAppConfig.ts'

export type PatchApiProfileMe200Profile = {
  id: string
  name: string
  username: string | null
  handle: string | null
  avatarUrl: string | null
  bio: string | null
  email?: string
  isAdmin?: boolean
  appConfig?: PatchApiProfileMe200ProfileAppConfig
  createdAt: string
  canEdit: boolean
}
