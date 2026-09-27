export type PostApiForumThreadsByThreadIdReportBodyThreeReason =
  (typeof PostApiForumThreadsByThreadIdReportBodyThreeReason)[keyof typeof PostApiForumThreadsByThreadIdReportBodyThreeReason]

export const PostApiForumThreadsByThreadIdReportBodyThreeReason = {
  spam: 'spam',
  harassment: 'harassment',
  off_topic: 'off_topic',
  other: 'other',
} as const
