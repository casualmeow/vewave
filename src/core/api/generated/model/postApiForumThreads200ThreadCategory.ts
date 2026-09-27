export type PostApiForumThreads200ThreadCategory =
  (typeof PostApiForumThreads200ThreadCategory)[keyof typeof PostApiForumThreads200ThreadCategory]

export const PostApiForumThreads200ThreadCategory = {
  general: 'general',
  bugs: 'bugs',
  features: 'features',
  help: 'help',
  announcements: 'announcements',
} as const
