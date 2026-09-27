import type { GetApiForumThreadsByThreadId200ThreadRepliesItemAuthor } from './getApiForumThreadsByThreadId200ThreadRepliesItemAuthor.ts'

export type GetApiForumThreadsByThreadId200ThreadRepliesItem = {
  id: string
  threadId: string
  body: string
  author: GetApiForumThreadsByThreadId200ThreadRepliesItemAuthor
  createdAt: string
}
