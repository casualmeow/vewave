import type { PostApiAuthRegister200UserAppConfig } from './postApiAuthRegister200UserAppConfig.ts'

export type PostApiAuthRegister200User = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig: PostApiAuthRegister200UserAppConfig
}
