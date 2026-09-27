export type PostApiForumThreadsByThreadIdReportBodyOneReason =
  (typeof PostApiForumThreadsByThreadIdReportBodyOneReason)[keyof typeof PostApiForumThreadsByThreadIdReportBodyOneReason]

export const PostApiForumThreadsByThreadIdReportBodyOneReason = {
  spam: 'spam',
  harassment: 'harassment',
  off_topic: 'off_topic',
  other: 'other',
} as const
