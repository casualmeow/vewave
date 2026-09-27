import type { PostApiAuthLogin401ErrorCode } from './postApiAuthLogin401ErrorCode.ts'

export type PostApiAuthLogin401Error = {
  code: PostApiAuthLogin401ErrorCode
  message: string
  details?: unknown
}
