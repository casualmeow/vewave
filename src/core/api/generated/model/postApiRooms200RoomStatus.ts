export type PostApiRooms200RoomStatus =
  (typeof PostApiRooms200RoomStatus)[keyof typeof PostApiRooms200RoomStatus]

export const PostApiRooms200RoomStatus = {
  active: 'active',
  ended: 'ended',
} as const
