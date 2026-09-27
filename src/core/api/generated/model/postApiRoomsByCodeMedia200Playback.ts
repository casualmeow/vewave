import type { PostApiRoomsByCodeMedia200PlaybackStatus } from './postApiRoomsByCodeMedia200PlaybackStatus.ts'

export type PostApiRoomsByCodeMedia200Playback = {
  status: PostApiRoomsByCodeMedia200PlaybackStatus
  positionMs: number
  effectivePositionMs: number
  playbackRate: number
  version: number
  updatedAt: string
  serverTimeMs: number
}
