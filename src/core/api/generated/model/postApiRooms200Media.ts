import type { PostApiRooms200MediaProvider } from './postApiRooms200MediaProvider.ts'

export type PostApiRooms200Media = {
  provider: PostApiRooms200MediaProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
