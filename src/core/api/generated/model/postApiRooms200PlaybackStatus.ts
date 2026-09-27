export type PostApiRooms200PlaybackStatus =
  (typeof PostApiRooms200PlaybackStatus)[keyof typeof PostApiRooms200PlaybackStatus]

export const PostApiRooms200PlaybackStatus = {
  playing: 'playing',
  paused: 'paused',
  buffering: 'buffering',
  ended: 'ended',
} as const
