import type { PostApiAuthLogin409ErrorCode } from './postApiAuthLogin409ErrorCode.ts'

export type PostApiAuthLogin409Error = {
  code: PostApiAuthLogin409ErrorCode
  message: string
  details?: unknown
}
