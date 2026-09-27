import type { PostApiAuthRefresh400ErrorCode } from './postApiAuthRefresh400ErrorCode.ts'

export type PostApiAuthRefresh400Error = {
  code: PostApiAuthRefresh400ErrorCode
  message: string
  details?: unknown
}
