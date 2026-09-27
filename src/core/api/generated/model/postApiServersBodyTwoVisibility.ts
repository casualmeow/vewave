export type PostApiServersBodyTwoVisibility =
  (typeof PostApiServersBodyTwoVisibility)[keyof typeof PostApiServersBodyTwoVisibility]

export const PostApiServersBodyTwoVisibility = {
  private: 'private',
  invite: 'invite',
  community: 'community',
} as const
