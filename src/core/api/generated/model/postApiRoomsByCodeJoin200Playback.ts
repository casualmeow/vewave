import type { PostApiRoomsByCodeJoin200PlaybackStatus } from './postApiRoomsByCodeJoin200PlaybackStatus.ts'

export type PostApiRoomsByCodeJoin200Playback = {
  status: PostApiRoomsByCodeJoin200PlaybackStatus
  positionMs: number
  effectivePositionMs: number
  playbackRate: number
  version: number
  updatedAt: string
  serverTimeMs: number
}
