import type { GetApiProfileMe400ErrorCode } from './getApiProfileMe400ErrorCode.ts'

export type GetApiProfileMe400Error = {
  code: GetApiProfileMe400ErrorCode
  message: string
  details?: unknown
}
