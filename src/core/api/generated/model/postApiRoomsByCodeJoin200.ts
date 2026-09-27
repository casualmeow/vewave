import type { PostApiRoomsByCodeJoin200Media } from './postApiRoomsByCodeJoin200Media.ts'
import type { PostApiRoomsByCodeJoin200MediaItemsItem } from './postApiRoomsByCodeJoin200MediaItemsItem.ts'
import type { PostApiRoomsByCodeJoin200Permissions } from './postApiRoomsByCodeJoin200Permissions.ts'
import type { PostApiRoomsByCodeJoin200Playback } from './postApiRoomsByCodeJoin200Playback.ts'
import type { PostApiRoomsByCodeJoin200Room } from './postApiRoomsByCodeJoin200Room.ts'

export type PostApiRoomsByCodeJoin200 = {
  room: PostApiRoomsByCodeJoin200Room
  media: PostApiRoomsByCodeJoin200Media
  mediaItems: PostApiRoomsByCodeJoin200MediaItemsItem[]
  playback: PostApiRoomsByCodeJoin200Playback
  permissions: PostApiRoomsByCodeJoin200Permissions
}
