import type { GetApiServers403ErrorCode } from './getApiServers403ErrorCode.ts'

export type GetApiServers403Error = {
  code: GetApiServers403ErrorCode
  message: string
  details?: unknown
}
