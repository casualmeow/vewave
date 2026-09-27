import type { PostApiServers500ErrorCode } from './postApiServers500ErrorCode.ts'

export type PostApiServers500Error = {
  code: PostApiServers500ErrorCode
  message: string
  details?: unknown
}
