export type PostApiForumThreadsBodyOneCategory =
  (typeof PostApiForumThreadsBodyOneCategory)[keyof typeof PostApiForumThreadsBodyOneCategory]

export const PostApiForumThreadsBodyOneCategory = {
  general: 'general',
  bugs: 'bugs',
  features: 'features',
  help: 'help',
  announcements: 'announcements',
} as const
