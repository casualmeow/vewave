import type { GetApiServers500ErrorCode } from './getApiServers500ErrorCode.ts'

export type GetApiServers500Error = {
  code: GetApiServers500ErrorCode
  message: string
  details?: unknown
}
