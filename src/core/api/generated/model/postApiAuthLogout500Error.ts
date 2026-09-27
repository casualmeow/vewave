import type { PostApiAuthLogout500ErrorCode } from './postApiAuthLogout500ErrorCode.ts'

export type PostApiAuthLogout500Error = {
  code: PostApiAuthLogout500ErrorCode
  message: string
  details?: unknown
}
