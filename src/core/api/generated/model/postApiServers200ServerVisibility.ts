export type PostApiServers200ServerVisibility =
  (typeof PostApiServers200ServerVisibility)[keyof typeof PostApiServers200ServerVisibility]

export const PostApiServers200ServerVisibility = {
  private: 'private',
  invite: 'invite',
  community: 'community',
} as const
