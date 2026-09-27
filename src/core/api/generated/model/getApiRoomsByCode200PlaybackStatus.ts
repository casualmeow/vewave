export type GetApiRoomsByCode200PlaybackStatus =
  (typeof GetApiRoomsByCode200PlaybackStatus)[keyof typeof GetApiRoomsByCode200PlaybackStatus]

export const GetApiRoomsByCode200PlaybackStatus = {
  playing: 'playing',
  paused: 'paused',
  buffering: 'buffering',
  ended: 'ended',
} as const
