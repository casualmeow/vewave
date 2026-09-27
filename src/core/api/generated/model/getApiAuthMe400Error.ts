import type { GetApiAuthMe400ErrorCode } from './getApiAuthMe400ErrorCode.ts'

export type GetApiAuthMe400Error = {
  code: GetApiAuthMe400ErrorCode
  message: string
  details?: unknown
}
