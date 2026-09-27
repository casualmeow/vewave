import type { PostApiRooms422ErrorCode } from './postApiRooms422ErrorCode.ts'

export type PostApiRooms422Error = {
  code: PostApiRooms422ErrorCode
  message: string
  details?: unknown
}
