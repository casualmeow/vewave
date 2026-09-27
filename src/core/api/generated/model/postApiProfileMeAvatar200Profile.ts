import type { PostApiProfileMeAvatar200ProfileAppConfig } from './postApiProfileMeAvatar200ProfileAppConfig.ts'

export type PostApiProfileMeAvatar200Profile = {
  id: string
  name: string
  username: string | null
  handle: string | null
  avatarUrl: string | null
  bio: string | null
  email?: string
  isAdmin?: boolean
  appConfig?: PostApiProfileMeAvatar200ProfileAppConfig
  createdAt: string
  canEdit: boolean
}
