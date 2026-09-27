import type { PostApiRooms200MediaItemsItemProvider } from './postApiRooms200MediaItemsItemProvider.ts'

export type PostApiRooms200MediaItemsItem = {
  id: string
  position: number
  provider: PostApiRooms200MediaItemsItemProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
