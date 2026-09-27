import type { PostApiForumThreadsByThreadIdReport200ReportReason } from './postApiForumThreadsByThreadIdReport200ReportReason.ts'
import type { PostApiForumThreadsByThreadIdReport200ReportStatus } from './postApiForumThreadsByThreadIdReport200ReportStatus.ts'

export type PostApiForumThreadsByThreadIdReport200Report = {
  id: string
  threadId: string
  reason: PostApiForumThreadsByThreadIdReport200ReportReason
  status: PostApiForumThreadsByThreadIdReport200ReportStatus
  createdAt: string
}
