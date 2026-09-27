import type { PostApiAuthRefresh401ErrorCode } from './postApiAuthRefresh401ErrorCode.ts'

export type PostApiAuthRefresh401Error = {
  code: PostApiAuthRefresh401ErrorCode
  message: string
  details?: unknown
}
