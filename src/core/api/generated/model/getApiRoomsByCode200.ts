import type { GetApiRoomsByCode200Media } from './getApiRoomsByCode200Media.ts'
import type { GetApiRoomsByCode200MediaItemsItem } from './getApiRoomsByCode200MediaItemsItem.ts'
import type { GetApiRoomsByCode200Permissions } from './getApiRoomsByCode200Permissions.ts'
import type { GetApiRoomsByCode200Playback } from './getApiRoomsByCode200Playback.ts'
import type { GetApiRoomsByCode200Room } from './getApiRoomsByCode200Room.ts'

export type GetApiRoomsByCode200 = {
  room: GetApiRoomsByCode200Room
  media: GetApiRoomsByCode200Media
  mediaItems: GetApiRoomsByCode200MediaItemsItem[]
  playback: GetApiRoomsByCode200Playback
  permissions: GetApiRoomsByCode200Permissions
}
