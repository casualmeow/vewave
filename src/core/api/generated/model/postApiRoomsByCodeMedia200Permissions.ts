import type { PostApiRoomsByCodeMedia200PermissionsRole } from './postApiRoomsByCodeMedia200PermissionsRole.ts'

export type PostApiRoomsByCodeMedia200Permissions = {
  role: PostApiRoomsByCodeMedia200PermissionsRole
  canControlPlayback: boolean
  canAddMedia: boolean
  canChat: boolean
  canModerate: boolean
}
