import type { PostApiForumThreads500ErrorCode } from './postApiForumThreads500ErrorCode.ts'

export type PostApiForumThreads500Error = {
  code: PostApiForumThreads500ErrorCode
  message: string
  details?: unknown
}
