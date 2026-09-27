import type { GetApiForumThreadsByThreadId200ThreadAuthor } from './getApiForumThreadsByThreadId200ThreadAuthor.ts'
import type { GetApiForumThreadsByThreadId200ThreadCategory } from './getApiForumThreadsByThreadId200ThreadCategory.ts'
import type { GetApiForumThreadsByThreadId200ThreadRepliesItem } from './getApiForumThreadsByThreadId200ThreadRepliesItem.ts'

export type GetApiForumThreadsByThreadId200Thread = {
  id: string
  category: GetApiForumThreadsByThreadId200ThreadCategory
  title: string
  body: string
  author: GetApiForumThreadsByThreadId200ThreadAuthor
  replyCount: number
  createdAt: string
  lastActivityAt: string
  replies: GetApiForumThreadsByThreadId200ThreadRepliesItem[]
}
