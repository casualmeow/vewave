import type { PostApiAuthLogin200UserAppConfig } from './postApiAuthLogin200UserAppConfig.ts'

export type PostApiAuthLogin200User = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig: PostApiAuthLogin200UserAppConfig
}
