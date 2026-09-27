import type { GetApiRoomsByCode200MediaProvider } from './getApiRoomsByCode200MediaProvider.ts'

export type GetApiRoomsByCode200Media = {
  provider: GetApiRoomsByCode200MediaProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
