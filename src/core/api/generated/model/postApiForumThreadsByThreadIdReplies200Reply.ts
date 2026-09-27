import type { PostApiForumThreadsByThreadIdReplies200ReplyAuthor } from './postApiForumThreadsByThreadIdReplies200ReplyAuthor.ts'

export type PostApiForumThreadsByThreadIdReplies200Reply = {
  id: string
  threadId: string
  body: string
  author: PostApiForumThreadsByThreadIdReplies200ReplyAuthor
  createdAt: string
}
