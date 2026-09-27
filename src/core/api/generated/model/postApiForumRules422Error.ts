import type { PostApiForumRules422ErrorCode } from './postApiForumRules422ErrorCode.ts'

export type PostApiForumRules422Error = {
  code: PostApiForumRules422ErrorCode
  message: string
  details?: unknown
}
