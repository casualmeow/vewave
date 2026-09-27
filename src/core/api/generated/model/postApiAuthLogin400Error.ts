import type { PostApiAuthLogin400ErrorCode } from './postApiAuthLogin400ErrorCode.ts'

export type PostApiAuthLogin400Error = {
  code: PostApiAuthLogin400ErrorCode
  message: string
  details?: unknown
}
