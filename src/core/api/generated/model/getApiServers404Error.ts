import type { GetApiServers404ErrorCode } from './getApiServers404ErrorCode.ts'

export type GetApiServers404Error = {
  code: GetApiServers404ErrorCode
  message: string
  details?: unknown
}
