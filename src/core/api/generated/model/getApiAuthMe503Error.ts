import type { GetApiAuthMe503ErrorCode } from './getApiAuthMe503ErrorCode.ts'

export type GetApiAuthMe503Error = {
  code: GetApiAuthMe503ErrorCode
  message: string
  details?: unknown
}
