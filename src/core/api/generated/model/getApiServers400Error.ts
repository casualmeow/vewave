import type { GetApiServers400ErrorCode } from './getApiServers400ErrorCode.ts'

export type GetApiServers400Error = {
  code: GetApiServers400ErrorCode
  message: string
  details?: unknown
}
