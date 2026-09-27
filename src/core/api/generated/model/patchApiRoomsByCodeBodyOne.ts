import type { PatchApiRoomsByCodeBodyOneStatus } from './patchApiRoomsByCodeBodyOneStatus.ts'
import type { PatchApiRoomsByCodeBodyOneVisibility } from './patchApiRoomsByCodeBodyOneVisibility.ts'

export type PatchApiRoomsByCodeBodyOne = {
  title?: string | '' | null
  visibility?: PatchApiRoomsByCodeBodyOneVisibility
  status?: PatchApiRoomsByCodeBodyOneStatus
}
