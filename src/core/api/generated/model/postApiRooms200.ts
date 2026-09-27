import type { PostApiRooms200Media } from './postApiRooms200Media.ts'
import type { PostApiRooms200MediaItemsItem } from './postApiRooms200MediaItemsItem.ts'
import type { PostApiRooms200Playback } from './postApiRooms200Playback.ts'
import type { PostApiRooms200Room } from './postApiRooms200Room.ts'

export type PostApiRooms200 = {
  room: PostApiRooms200Room
  media: PostApiRooms200Media
  mediaItems: PostApiRooms200MediaItemsItem[]
  playback: PostApiRooms200Playback
}
