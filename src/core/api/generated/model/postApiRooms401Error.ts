import type { PostApiRooms401ErrorCode } from './postApiRooms401ErrorCode.ts'

export type PostApiRooms401Error = {
  code: PostApiRooms401ErrorCode
  message: string
  details?: unknown
}
