import type { PostApiAuthLogin503ErrorCode } from './postApiAuthLogin503ErrorCode.ts'

export type PostApiAuthLogin503Error = {
  code: PostApiAuthLogin503ErrorCode
  message: string
  details?: unknown
}
