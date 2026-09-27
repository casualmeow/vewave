import type { PostApiServers400ErrorCode } from './postApiServers400ErrorCode.ts'

export type PostApiServers400Error = {
  code: PostApiServers400ErrorCode
  message: string
  details?: unknown
}
