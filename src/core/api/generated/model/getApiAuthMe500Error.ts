import type { GetApiAuthMe500ErrorCode } from './getApiAuthMe500ErrorCode.ts'

export type GetApiAuthMe500Error = {
  code: GetApiAuthMe500ErrorCode
  message: string
  details?: unknown
}
