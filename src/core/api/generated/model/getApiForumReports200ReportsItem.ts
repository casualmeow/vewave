import type { GetApiForumReports200ReportsItemReason } from './getApiForumReports200ReportsItemReason.ts'
import type { GetApiForumReports200ReportsItemReporter } from './getApiForumReports200ReportsItemReporter.ts'
import type { GetApiForumReports200ReportsItemStatus } from './getApiForumReports200ReportsItemStatus.ts'

export type GetApiForumReports200ReportsItem = {
  id: string
  threadId: string
  threadTitle: string | null
  reason: GetApiForumReports200ReportsItemReason
  details: string | null
  status: GetApiForumReports200ReportsItemStatus
  reporter: GetApiForumReports200ReportsItemReporter
  createdAt: string
}
