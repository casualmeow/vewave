export type PatchApiRoomsByCodeBodyOneVisibility =
  (typeof PatchApiRoomsByCodeBodyOneVisibility)[keyof typeof PatchApiRoomsByCodeBodyOneVisibility]

export const PatchApiRoomsByCodeBodyOneVisibility = {
  private: 'private',
  unlisted: 'unlisted',
  public: 'public',
} as const
