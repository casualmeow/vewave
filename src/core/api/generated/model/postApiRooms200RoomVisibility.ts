export type PostApiRooms200RoomVisibility =
  (typeof PostApiRooms200RoomVisibility)[keyof typeof PostApiRooms200RoomVisibility]

export const PostApiRooms200RoomVisibility = {
  private: 'private',
  unlisted: 'unlisted',
  public: 'public',
} as const
