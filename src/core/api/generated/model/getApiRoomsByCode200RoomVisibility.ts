export type GetApiRoomsByCode200RoomVisibility =
  (typeof GetApiRoomsByCode200RoomVisibility)[keyof typeof GetApiRoomsByCode200RoomVisibility]

export const GetApiRoomsByCode200RoomVisibility = {
  private: 'private',
  unlisted: 'unlisted',
  public: 'public',
} as const
