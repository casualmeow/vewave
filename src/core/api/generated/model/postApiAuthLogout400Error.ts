import type { PostApiAuthLogout400ErrorCode } from './postApiAuthLogout400ErrorCode.ts'

export type PostApiAuthLogout400Error = {
  code: PostApiAuthLogout400ErrorCode
  message: string
  details?: unknown
}
