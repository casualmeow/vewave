import type { PostApiForumThreads200ThreadRepliesItemAuthor } from './postApiForumThreads200ThreadRepliesItemAuthor.ts'

export type PostApiForumThreads200ThreadRepliesItem = {
  id: string
  threadId: string
  body: string
  author: PostApiForumThreads200ThreadRepliesItemAuthor
  createdAt: string
}
