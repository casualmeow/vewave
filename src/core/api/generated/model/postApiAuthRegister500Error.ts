import type { PostApiAuthRegister500ErrorCode } from './postApiAuthRegister500ErrorCode.ts'

export type PostApiAuthRegister500Error = {
  code: PostApiAuthRegister500ErrorCode
  message: string
  details?: unknown
}
