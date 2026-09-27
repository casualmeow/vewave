import type { PostApiForumRules401ErrorCode } from './postApiForumRules401ErrorCode.ts'

export type PostApiForumRules401Error = {
  code: PostApiForumRules401ErrorCode
  message: string
  details?: unknown
}
