import type { PostApiAuthPasskeyRegisterVerify200UserAppConfig } from './postApiAuthPasskeyRegisterVerify200UserAppConfig.ts'

export type PostApiAuthPasskeyRegisterVerify200User = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig: PostApiAuthPasskeyRegisterVerify200UserAppConfig
}
