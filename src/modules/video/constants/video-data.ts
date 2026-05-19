import type { VideoEntity } from '@/core/api/video'

enum VideoPlaylists {
  playlist1 = 'Playlist 1',
  playlist2 = 'Playlist 2',
  playlist3 = 'Playlist 3',
}

export const VideoData: VideoEntity = {
  id: '1',
  name: 'Sample Video',
  description: 'This is a sample video description.',
  src: 'https://www.w3schools.com/html/mov_bbb.mp4',
  thumbnail: 'https://www.w3schools.com/html/pic_trulli.jpg',
  playlists: [VideoPlaylists.playlist1, VideoPlaylists.playlist2, VideoPlaylists.playlist3],
  access: 'Private',
  createdAt: new Date(),
  updatedAt: new Date(),
}
