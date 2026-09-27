import type { GetApiProfileMe200ProfileAppConfig } from './getApiProfileMe200ProfileAppConfig.ts'

export type GetApiProfileMe200Profile = {
  id: string
  name: string
  username: string | null
  handle: string | null
  avatarUrl: string | null
  bio: string | null
  email?: string
  isAdmin?: boolean
  appConfig?: GetApiProfileMe200ProfileAppConfig
  createdAt: string
  canEdit: boolean
}
