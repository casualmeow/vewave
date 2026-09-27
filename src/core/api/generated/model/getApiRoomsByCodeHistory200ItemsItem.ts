import type { GetApiRoomsByCodeHistory200ItemsItemProvider } from './getApiRoomsByCodeHistory200ItemsItemProvider.ts'

export type GetApiRoomsByCodeHistory200ItemsItem = {
  mediaItemId: string
  position: number
  selectedByName: string | null
  playedAt: string
  provider: GetApiRoomsByCodeHistory200ItemsItemProvider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
