import type { PostApiAuthRegister400ErrorCode } from './postApiAuthRegister400ErrorCode.ts'

export type PostApiAuthRegister400Error = {
  code: PostApiAuthRegister400ErrorCode
  message: string
  details?: unknown
}
