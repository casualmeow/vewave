import type { PostApiForumThreads400ErrorCode } from './postApiForumThreads400ErrorCode.ts'

export type PostApiForumThreads400Error = {
  code: PostApiForumThreads400ErrorCode
  message: string
  details?: unknown
}
