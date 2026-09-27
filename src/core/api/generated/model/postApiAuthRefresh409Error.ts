import type { PostApiAuthRefresh409ErrorCode } from './postApiAuthRefresh409ErrorCode.ts'

export type PostApiAuthRefresh409Error = {
  code: PostApiAuthRefresh409ErrorCode
  message: string
  details?: unknown
}
