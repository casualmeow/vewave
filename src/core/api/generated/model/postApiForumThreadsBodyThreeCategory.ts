export type PostApiForumThreadsBodyThreeCategory =
  (typeof PostApiForumThreadsBodyThreeCategory)[keyof typeof PostApiForumThreadsBodyThreeCategory]

export const PostApiForumThreadsBodyThreeCategory = {
  general: 'general',
  bugs: 'bugs',
  features: 'features',
  help: 'help',
  announcements: 'announcements',
} as const
