import type { PostApiServers404ErrorCode } from './postApiServers404ErrorCode.ts'

export type PostApiServers404Error = {
  code: PostApiServers404ErrorCode
  message: string
  details?: unknown
}
