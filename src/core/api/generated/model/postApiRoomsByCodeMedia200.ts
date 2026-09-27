import type { PostApiRoomsByCodeMedia200Media } from './postApiRoomsByCodeMedia200Media.ts'
import type { PostApiRoomsByCodeMedia200MediaItemsItem } from './postApiRoomsByCodeMedia200MediaItemsItem.ts'
import type { PostApiRoomsByCodeMedia200Permissions } from './postApiRoomsByCodeMedia200Permissions.ts'
import type { PostApiRoomsByCodeMedia200Playback } from './postApiRoomsByCodeMedia200Playback.ts'
import type { PostApiRoomsByCodeMedia200Room } from './postApiRoomsByCodeMedia200Room.ts'

export type PostApiRoomsByCodeMedia200 = {
  room: PostApiRoomsByCodeMedia200Room
  media: PostApiRoomsByCodeMedia200Media
  mediaItems: PostApiRoomsByCodeMedia200MediaItemsItem[]
  playback: PostApiRoomsByCodeMedia200Playback
  permissions: PostApiRoomsByCodeMedia200Permissions
}
