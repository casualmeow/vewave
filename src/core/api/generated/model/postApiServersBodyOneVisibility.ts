export type PostApiServersBodyOneVisibility =
  (typeof PostApiServersBodyOneVisibility)[keyof typeof PostApiServersBodyOneVisibility]

export const PostApiServersBodyOneVisibility = {
  private: 'private',
  invite: 'invite',
  community: 'community',
} as const
