import type { PostApiRooms404ErrorCode } from './postApiRooms404ErrorCode.ts'

export type PostApiRooms404Error = {
  code: PostApiRooms404ErrorCode
  message: string
  details?: unknown
}
