import type { GetApiServers401ErrorCode } from './getApiServers401ErrorCode.ts'

export type GetApiServers401Error = {
  code: GetApiServers401ErrorCode
  message: string
  details?: unknown
}
