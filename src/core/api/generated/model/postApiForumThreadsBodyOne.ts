import type { PostApiForumThreadsBodyOneCategory } from './postApiForumThreadsBodyOneCategory.ts'

export type PostApiForumThreadsBodyOne = {
  category?: PostApiForumThreadsBodyOneCategory
  title: string
  body: string
}
