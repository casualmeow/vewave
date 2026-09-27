import type { PostApiRoomsByCodeJoin200MediaItemsItemProvider } from './postApiRoomsByCodeJoin200MediaItemsItemProvider.ts'

export type PostApiRoomsByCodeJoin200MediaItemsItem = {
  id: string
  position: number
  provider: PostApiRoomsByCodeJoin200MediaItemsItemProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
