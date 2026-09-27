import type { PostApiAuthRefresh500ErrorCode } from './postApiAuthRefresh500ErrorCode.ts'

export type PostApiAuthRefresh500Error = {
  code: PostApiAuthRefresh500ErrorCode
  message: string
  details?: unknown
}
