import type { GetApiAuthMe401ErrorCode } from './getApiAuthMe401ErrorCode.ts'

export type GetApiAuthMe401Error = {
  code: GetApiAuthMe401ErrorCode
  message: string
  details?: unknown
}
