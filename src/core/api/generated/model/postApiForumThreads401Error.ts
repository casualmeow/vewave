import type { PostApiForumThreads401ErrorCode } from './postApiForumThreads401ErrorCode.ts'

export type PostApiForumThreads401Error = {
  code: PostApiForumThreads401ErrorCode
  message: string
  details?: unknown
}
