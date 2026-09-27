import type { PostApiForumRules403ErrorCode } from './postApiForumRules403ErrorCode.ts'

export type PostApiForumRules403Error = {
  code: PostApiForumRules403ErrorCode
  message: string
  details?: unknown
}
