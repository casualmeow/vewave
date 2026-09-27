import type { PatchApiProfileMeBodyOneAppConfig } from './patchApiProfileMeBodyOneAppConfig.ts'

export type PatchApiProfileMeBodyOne = {
  name?: string
  username?: string | null
  avatarUrl?: string | null
  bio?: string | null
  appConfig?: PatchApiProfileMeBodyOneAppConfig
}
