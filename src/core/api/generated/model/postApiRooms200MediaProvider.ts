export type PostApiRooms200MediaProvider =
  (typeof PostApiRooms200MediaProvider)[keyof typeof PostApiRooms200MediaProvider]

export const PostApiRooms200MediaProvider = {
  youtube: 'youtube',
  vimeo: 'vimeo',
  tiktok: 'tiktok',
  unknown: 'unknown',
} as const
