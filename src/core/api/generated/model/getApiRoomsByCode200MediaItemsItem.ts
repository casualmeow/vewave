import type { GetApiRoomsByCode200MediaItemsItemProvider } from './getApiRoomsByCode200MediaItemsItemProvider.ts'

export type GetApiRoomsByCode200MediaItemsItem = {
  id: string
  position: number
  provider: GetApiRoomsByCode200MediaItemsItemProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
