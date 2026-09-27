import type { PatchApiRoomsByCode200RoomStatus } from './patchApiRoomsByCode200RoomStatus.ts'
import type { PatchApiRoomsByCode200RoomVisibility } from './patchApiRoomsByCode200RoomVisibility.ts'

export type PatchApiRoomsByCode200Room = {
  id: string
  code: string
  title: string | null
  visibility: PatchApiRoomsByCode200RoomVisibility
  status: PatchApiRoomsByCode200RoomStatus
  createdAt: string
  endedAt: string | null
}
