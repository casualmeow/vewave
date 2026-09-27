import type { GetApiAuthMe200UserAppConfig } from './getApiAuthMe200UserAppConfig.ts'

export type GetApiAuthMe200User = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig: GetApiAuthMe200UserAppConfig
}
