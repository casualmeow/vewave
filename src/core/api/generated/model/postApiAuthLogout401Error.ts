import type { PostApiAuthLogout401ErrorCode } from './postApiAuthLogout401ErrorCode.ts'

export type PostApiAuthLogout401Error = {
  code: PostApiAuthLogout401ErrorCode
  message: string
  details?: unknown
}
