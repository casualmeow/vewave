export type PatchApiRoomsByCode200RoomVisibility =
  (typeof PatchApiRoomsByCode200RoomVisibility)[keyof typeof PatchApiRoomsByCode200RoomVisibility]

export const PatchApiRoomsByCode200RoomVisibility = {
  private: 'private',
  unlisted: 'unlisted',
  public: 'public',
} as const
