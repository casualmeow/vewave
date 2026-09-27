export type GetApiForumThreadsCategory =
  (typeof GetApiForumThreadsCategory)[keyof typeof GetApiForumThreadsCategory]

export const GetApiForumThreadsCategory = {
  general: 'general',
  bugs: 'bugs',
  features: 'features',
  help: 'help',
  announcements: 'announcements',
} as const
