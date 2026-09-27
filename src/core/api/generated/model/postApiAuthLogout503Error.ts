import type { PostApiAuthLogout503ErrorCode } from './postApiAuthLogout503ErrorCode.ts'

export type PostApiAuthLogout503Error = {
  code: PostApiAuthLogout503ErrorCode
  message: string
  details?: unknown
}
