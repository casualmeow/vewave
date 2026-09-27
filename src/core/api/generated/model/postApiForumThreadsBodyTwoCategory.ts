export type PostApiForumThreadsBodyTwoCategory =
  (typeof PostApiForumThreadsBodyTwoCategory)[keyof typeof PostApiForumThreadsBodyTwoCategory]

export const PostApiForumThreadsBodyTwoCategory = {
  general: 'general',
  bugs: 'bugs',
  features: 'features',
  help: 'help',
  announcements: 'announcements',
} as const
