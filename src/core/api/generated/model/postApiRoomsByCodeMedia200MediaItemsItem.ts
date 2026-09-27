import type { PostApiRoomsByCodeMedia200MediaItemsItemProvider } from './postApiRoomsByCodeMedia200MediaItemsItemProvider.ts'

export type PostApiRoomsByCodeMedia200MediaItemsItem = {
  id: string
  position: number
  provider: PostApiRoomsByCodeMedia200MediaItemsItemProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
