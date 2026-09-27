import type { PostApiAuthLogin500ErrorCode } from './postApiAuthLogin500ErrorCode.ts'

export type PostApiAuthLogin500Error = {
  code: PostApiAuthLogin500ErrorCode
  message: string
  details?: unknown
}
