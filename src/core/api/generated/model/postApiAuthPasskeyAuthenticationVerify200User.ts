import type { PostApiAuthPasskeyAuthenticationVerify200UserAppConfig } from './postApiAuthPasskeyAuthenticationVerify200UserAppConfig.ts'

export type PostApiAuthPasskeyAuthenticationVerify200User = {
  id: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  isAdmin: boolean
  appConfig: PostApiAuthPasskeyAuthenticationVerify200UserAppConfig
}
