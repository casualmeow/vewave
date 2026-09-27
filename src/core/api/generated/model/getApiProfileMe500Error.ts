import type { GetApiProfileMe500ErrorCode } from './getApiProfileMe500ErrorCode.ts'

export type GetApiProfileMe500Error = {
  code: GetApiProfileMe500ErrorCode
  message: string
  details?: unknown
}
