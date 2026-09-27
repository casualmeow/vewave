import type { PostApiRoomsByCodeJoin200RoomStatus } from './postApiRoomsByCodeJoin200RoomStatus.ts'
import type { PostApiRoomsByCodeJoin200RoomVisibility } from './postApiRoomsByCodeJoin200RoomVisibility.ts'

export type PostApiRoomsByCodeJoin200Room = {
  id: string
  code: string
  title: string | null
  visibility: PostApiRoomsByCodeJoin200RoomVisibility
  status: PostApiRoomsByCodeJoin200RoomStatus
  createdAt: string
  endedAt: string | null
}
