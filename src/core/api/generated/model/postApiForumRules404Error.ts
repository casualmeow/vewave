import type { PostApiForumRules404ErrorCode } from './postApiForumRules404ErrorCode.ts'

export type PostApiForumRules404Error = {
  code: PostApiForumRules404ErrorCode
  message: string
  details?: unknown
}
