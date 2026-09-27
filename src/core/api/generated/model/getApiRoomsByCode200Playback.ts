import type { GetApiRoomsByCode200PlaybackStatus } from './getApiRoomsByCode200PlaybackStatus.ts'

export type GetApiRoomsByCode200Playback = {
  status: GetApiRoomsByCode200PlaybackStatus
  positionMs: number
  effectivePositionMs: number
  playbackRate: number
  version: number
  updatedAt: string
  serverTimeMs: number
}
