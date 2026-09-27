import type { PatchApiProfileMeBodyThreeAppConfig } from './patchApiProfileMeBodyThreeAppConfig.ts'

export type PatchApiProfileMeBodyThree = {
  name?: string
  username?: string | null
  avatarUrl?: string | null
  bio?: string | null
  appConfig?: PatchApiProfileMeBodyThreeAppConfig
}
