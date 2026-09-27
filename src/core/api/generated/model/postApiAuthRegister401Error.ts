import type { PostApiAuthRegister401ErrorCode } from './postApiAuthRegister401ErrorCode.ts'

export type PostApiAuthRegister401Error = {
  code: PostApiAuthRegister401ErrorCode
  message: string
  details?: unknown
}
