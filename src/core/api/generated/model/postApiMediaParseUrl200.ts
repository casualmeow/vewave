import type { PostApiMediaParseUrl200Provider } from './postApiMediaParseUrl200Provider.ts'

export type PostApiMediaParseUrl200 = {
  provider: PostApiMediaParseUrl200Provider
  externalId: string
  canonicalUrl: string
  embedUrl?: string
  title?: string
  thumbnailUrl?: string
}
