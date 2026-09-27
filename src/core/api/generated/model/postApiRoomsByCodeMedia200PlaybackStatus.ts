export type PostApiRoomsByCodeMedia200PlaybackStatus =
  (typeof PostApiRoomsByCodeMedia200PlaybackStatus)[keyof typeof PostApiRoomsByCodeMedia200PlaybackStatus]

export const PostApiRoomsByCodeMedia200PlaybackStatus = {
  playing: 'playing',
  paused: 'paused',
  buffering: 'buffering',
  ended: 'ended',
} as const
