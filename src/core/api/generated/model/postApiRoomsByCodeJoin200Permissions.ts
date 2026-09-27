import type { PostApiRoomsByCodeJoin200PermissionsRole } from './postApiRoomsByCodeJoin200PermissionsRole.ts'

export type PostApiRoomsByCodeJoin200Permissions = {
  role: PostApiRoomsByCodeJoin200PermissionsRole
  canControlPlayback: boolean
  canAddMedia: boolean
  canChat: boolean
  canModerate: boolean
}
