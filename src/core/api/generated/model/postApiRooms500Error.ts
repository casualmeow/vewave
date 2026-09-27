import type { PostApiRooms500ErrorCode } from './postApiRooms500ErrorCode.ts'

export type PostApiRooms500Error = {
  code: PostApiRooms500ErrorCode
  message: string
  details?: unknown
}
