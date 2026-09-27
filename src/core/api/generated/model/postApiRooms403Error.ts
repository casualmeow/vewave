import type { PostApiRooms403ErrorCode } from './postApiRooms403ErrorCode.ts'

export type PostApiRooms403Error = {
  code: PostApiRooms403ErrorCode
  message: string
  details?: unknown
}
