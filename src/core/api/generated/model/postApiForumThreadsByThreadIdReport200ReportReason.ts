export type PostApiForumThreadsByThreadIdReport200ReportReason =
  (typeof PostApiForumThreadsByThreadIdReport200ReportReason)[keyof typeof PostApiForumThreadsByThreadIdReport200ReportReason]

export const PostApiForumThreadsByThreadIdReport200ReportReason = {
  spam: 'spam',
  harassment: 'harassment',
  off_topic: 'off_topic',
  other: 'other',
} as const
