export type PostApiRoomsByCodeJoin200PlaybackStatus =
  (typeof PostApiRoomsByCodeJoin200PlaybackStatus)[keyof typeof PostApiRoomsByCodeJoin200PlaybackStatus]

export const PostApiRoomsByCodeJoin200PlaybackStatus = {
  playing: 'playing',
  paused: 'paused',
  buffering: 'buffering',
  ended: 'ended',
} as const
