import type { PostApiServers422ErrorCode } from './postApiServers422ErrorCode.ts'

export type PostApiServers422Error = {
  code: PostApiServers422ErrorCode
  message: string
  details?: unknown
}
