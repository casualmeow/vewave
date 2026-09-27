import type { GetApiForumThreads500ErrorCode } from './getApiForumThreads500ErrorCode.ts'

export type GetApiForumThreads500Error = {
  code: GetApiForumThreads500ErrorCode
  message: string
  details?: unknown
}
