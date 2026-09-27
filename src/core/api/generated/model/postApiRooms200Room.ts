import type { PostApiRooms200RoomStatus } from './postApiRooms200RoomStatus.ts'
import type { PostApiRooms200RoomVisibility } from './postApiRooms200RoomVisibility.ts'

export type PostApiRooms200Room = {
  id: string
  code: string
  title: string | null
  visibility: PostApiRooms200RoomVisibility
  status: PostApiRooms200RoomStatus
  createdAt: string
  endedAt: string | null
}
