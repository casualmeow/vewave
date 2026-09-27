export type PostApiServersBodyThreeVisibility =
  (typeof PostApiServersBodyThreeVisibility)[keyof typeof PostApiServersBodyThreeVisibility]

export const PostApiServersBodyThreeVisibility = {
  private: 'private',
  invite: 'invite',
  community: 'community',
} as const
