import type { PostApiForumThreads200ThreadAuthor } from './postApiForumThreads200ThreadAuthor.ts'
import type { PostApiForumThreads200ThreadCategory } from './postApiForumThreads200ThreadCategory.ts'
import type { PostApiForumThreads200ThreadRepliesItem } from './postApiForumThreads200ThreadRepliesItem.ts'

export type PostApiForumThreads200Thread = {
  id: string
  category: PostApiForumThreads200ThreadCategory
  title: string
  body: string
  author: PostApiForumThreads200ThreadAuthor
  replyCount: number
  createdAt: string
  lastActivityAt: string
  replies: PostApiForumThreads200ThreadRepliesItem[]
}
