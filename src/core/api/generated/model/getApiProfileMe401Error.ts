import type { GetApiProfileMe401ErrorCode } from './getApiProfileMe401ErrorCode.ts'

export type GetApiProfileMe401Error = {
  code: GetApiProfileMe401ErrorCode
  message: string
  details?: unknown
}
