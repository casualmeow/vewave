import type { PostApiServers403ErrorCode } from './postApiServers403ErrorCode.ts'

export type PostApiServers403Error = {
  code: PostApiServers403ErrorCode
  message: string
  details?: unknown
}
