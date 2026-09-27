import type { PostApiRooms200PlaybackStatus } from './postApiRooms200PlaybackStatus.ts'

export type PostApiRooms200Playback = {
  status: PostApiRooms200PlaybackStatus
  positionMs: number
  effectivePositionMs: number
  playbackRate: number
  version: number
  updatedAt: string
  serverTimeMs: number
}
