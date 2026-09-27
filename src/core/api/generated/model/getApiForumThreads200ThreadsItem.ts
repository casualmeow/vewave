import type { GetApiForumThreads200ThreadsItemAuthor } from './getApiForumThreads200ThreadsItemAuthor.ts'
import type { GetApiForumThreads200ThreadsItemCategory } from './getApiForumThreads200ThreadsItemCategory.ts'

export type GetApiForumThreads200ThreadsItem = {
  id: string
  category: GetApiForumThreads200ThreadsItemCategory
  title: string
  body: string
  author: GetApiForumThreads200ThreadsItemAuthor
  replyCount: number
  createdAt: string
  lastActivityAt: string
}
