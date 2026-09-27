import type { PostApiForumRules500ErrorCode } from './postApiForumRules500ErrorCode.ts'

export type PostApiForumRules500Error = {
  code: PostApiForumRules500ErrorCode
  message: string
  details?: unknown
}
