import type { PostApiRooms409ErrorCode } from './postApiRooms409ErrorCode.ts'

export type PostApiRooms409Error = {
  code: PostApiRooms409ErrorCode
  message: string
  details?: unknown
}
