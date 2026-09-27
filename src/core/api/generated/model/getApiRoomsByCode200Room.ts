import type { GetApiRoomsByCode200RoomStatus } from './getApiRoomsByCode200RoomStatus.ts'
import type { GetApiRoomsByCode200RoomVisibility } from './getApiRoomsByCode200RoomVisibility.ts'

export type GetApiRoomsByCode200Room = {
  id: string
  code: string
  title: string | null
  visibility: GetApiRoomsByCode200RoomVisibility
  status: GetApiRoomsByCode200RoomStatus
  createdAt: string
  endedAt: string | null
}
