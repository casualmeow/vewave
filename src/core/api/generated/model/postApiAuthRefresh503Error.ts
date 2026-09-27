import type { PostApiAuthRefresh503ErrorCode } from './postApiAuthRefresh503ErrorCode.ts'

export type PostApiAuthRefresh503Error = {
  code: PostApiAuthRefresh503ErrorCode
  message: string
  details?: unknown
}
