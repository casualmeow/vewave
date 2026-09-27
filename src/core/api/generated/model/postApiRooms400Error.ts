import type { PostApiRooms400ErrorCode } from './postApiRooms400ErrorCode.ts'

export type PostApiRooms400Error = {
  code: PostApiRooms400ErrorCode
  message: string
  details?: unknown
}
