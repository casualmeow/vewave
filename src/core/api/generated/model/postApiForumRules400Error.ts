import type { PostApiForumRules400ErrorCode } from './postApiForumRules400ErrorCode.ts'

export type PostApiForumRules400Error = {
  code: PostApiForumRules400ErrorCode
  message: string
  details?: unknown
}
