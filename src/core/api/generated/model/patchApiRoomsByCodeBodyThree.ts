import type { PatchApiRoomsByCodeBodyThreeStatus } from './patchApiRoomsByCodeBodyThreeStatus.ts'
import type { PatchApiRoomsByCodeBodyThreeVisibility } from './patchApiRoomsByCodeBodyThreeVisibility.ts'

export type PatchApiRoomsByCodeBodyThree = {
  title?: string | '' | null
  visibility?: PatchApiRoomsByCodeBodyThreeVisibility
  status?: PatchApiRoomsByCodeBodyThreeStatus
}
