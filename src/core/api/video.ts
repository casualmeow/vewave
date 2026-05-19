export type VideoEntity = {
  id: string
  name: string
  description: string
  src: string
  thumbnail: string
  playlists?: Array<string>
  access: 'Public' | 'Unlisted' | 'Private'
  createdAt: Date
  updatedAt: Date
}
