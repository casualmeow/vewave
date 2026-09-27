import type { PostApiAuthRegister503ErrorCode } from './postApiAuthRegister503ErrorCode.ts'

export type PostApiAuthRegister503Error = {
  code: PostApiAuthRegister503ErrorCode
  message: string
  details?: unknown
}
