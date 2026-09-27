import type { PatchApiRoomsByCodeBodyTwoStatus } from './patchApiRoomsByCodeBodyTwoStatus.ts'
import type { PatchApiRoomsByCodeBodyTwoVisibility } from './patchApiRoomsByCodeBodyTwoVisibility.ts'

export type PatchApiRoomsByCodeBodyTwo = {
  title?: string | '' | null
  visibility?: PatchApiRoomsByCodeBodyTwoVisibility
  status?: PatchApiRoomsByCodeBodyTwoStatus
}
