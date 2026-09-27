import type { PatchApiProfileMeBodyTwoAppConfig } from './patchApiProfileMeBodyTwoAppConfig.ts'

export type PatchApiProfileMeBodyTwo = {
  name?: string
  username?: string | null
  avatarUrl?: string | null
  bio?: string | null
  appConfig?: PatchApiProfileMeBodyTwoAppConfig
}
