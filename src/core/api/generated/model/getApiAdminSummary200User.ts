import type { GetApiAdminSummary200UserAppConfig } from './getApiAdminSummary200UserAppConfig.ts'

export type GetApiAdminSummary200User = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig: GetApiAdminSummary200UserAppConfig
}
