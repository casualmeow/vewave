import type { GetApiRoomsByCode500ErrorCode } from './getApiRoomsByCode500ErrorCode.ts'

export type GetApiRoomsByCode500Error = {
  code: GetApiRoomsByCode500ErrorCode
  message: string
  details?: unknown
}
