import type { GetApiRoomsByCode200PermissionsRole } from './getApiRoomsByCode200PermissionsRole.ts'

export type GetApiRoomsByCode200Permissions = {
  role: GetApiRoomsByCode200PermissionsRole
  canControlPlayback: boolean
  canAddMedia: boolean
  canChat: boolean
  canModerate: boolean
}
