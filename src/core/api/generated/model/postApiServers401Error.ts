import type { PostApiServers401ErrorCode } from './postApiServers401ErrorCode.ts'

export type PostApiServers401Error = {
  code: PostApiServers401ErrorCode
  message: string
  details?: unknown
}
