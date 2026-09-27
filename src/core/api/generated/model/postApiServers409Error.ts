import type { PostApiServers409ErrorCode } from './postApiServers409ErrorCode.ts'

export type PostApiServers409Error = {
  code: PostApiServers409ErrorCode
  message: string
  details?: unknown
}
