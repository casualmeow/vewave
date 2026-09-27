import type { PostApiRoomsByCodeMedia200RoomStatus } from './postApiRoomsByCodeMedia200RoomStatus.ts'
import type { PostApiRoomsByCodeMedia200RoomVisibility } from './postApiRoomsByCodeMedia200RoomVisibility.ts'

export type PostApiRoomsByCodeMedia200Room = {
  id: string
  code: string
  title: string | null
  visibility: PostApiRoomsByCodeMedia200RoomVisibility
  status: PostApiRoomsByCodeMedia200RoomStatus
  createdAt: string
  endedAt: string | null
}
