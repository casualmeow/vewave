import type { GetApiProfileByUsername200ProfileAppConfig } from './getApiProfileByUsername200ProfileAppConfig.ts'

export type GetApiProfileByUsername200Profile = {
  id: string
  name: string
  username: string | null
  handle: string | null
  avatarUrl: string | null
  bio: string | null
  email?: string
  isAdmin?: boolean
  appConfig?: GetApiProfileByUsername200ProfileAppConfig
  createdAt: string
  canEdit: boolean
}
