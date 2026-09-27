export type PostApiForumThreadsByThreadIdReportBodyTwoReason =
  (typeof PostApiForumThreadsByThreadIdReportBodyTwoReason)[keyof typeof PostApiForumThreadsByThreadIdReportBodyTwoReason]

export const PostApiForumThreadsByThreadIdReportBodyTwoReason = {
  spam: 'spam',
  harassment: 'harassment',
  off_topic: 'off_topic',
  other: 'other',
} as const
