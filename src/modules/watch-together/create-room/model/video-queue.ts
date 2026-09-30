import { createRoomSchema, getCreateRoomVideoLinks } from '../schema'
import type { PostApiMediaParseUrl200 } from '@/core/api/generated/model'
import { getApiErrorMessage } from '@/core/api/http/errors'

export type DraftVideo = {
  id: string
  url: string
  status: 'loading' | 'ready' | 'error'
  media?: PostApiMediaParseUrl200
  error?: string
}

export type VideoQueueSnapshot = {
  videos: Array<DraftVideo>
  selectedId: string | null
  message: string
}

export function createVideoQueue(parse: (url: string) => Promise<PostApiMediaParseUrl200>) {
  let sequence = 0
  let snapshot: VideoQueueSnapshot = { videos: [], selectedId: null, message: '' }
  const listeners = new Set<() => void>()
  const cache = new Map<string, Promise<PostApiMediaParseUrl200>>()

  function publish(next: VideoQueueSnapshot) {
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  function entry(url: string): DraftVideo {
    return { id: `video-${++sequence}`, url, status: 'loading' }
  }

  async function validate(video: DraftVideo) {
    const validation = createRoomSchema.shape.url.safeParse(video.url)
    let next: DraftVideo
    try {
      if (!validation.success) throw new Error(validation.error.issues[0].message)
      let request = cache.get(video.url)
      if (!request) {
        request = parse(video.url)
        cache.set(video.url, request)
      }
      next = { ...video, status: 'ready', media: await request }
    } catch (error) {
      cache.delete(video.url)
      next = {
        ...video,
        status: 'error',
        error: getApiErrorMessage(error, 'Could not check this link. Try again.'),
      }
    }
    if (!snapshot.videos.some((item) => item.id === video.id)) return
    publish({
      ...snapshot,
      videos: snapshot.videos.map((item) => (item.id === video.id ? next : item)),
    })
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => snapshot,
    add(value: string) {
      const links = getCreateRoomVideoLinks(value)
      const existing = new Set(snapshot.videos.map((video) => video.url))
      const additions = links.filter((url) => !existing.has(url)).map(entry)
      if (!links.length) {
        publish({ ...snapshot, message: 'Paste a video link first.' })
        return false
      }
      if (snapshot.videos.length + additions.length > 20) {
        publish({
          ...snapshot,
          message: 'A room can start with up to 20 videos. Remove a few before adding more.',
        })
        return false
      }
      const duplicateCount =
        value.split(/\r?\n/).filter((line) => line.trim()).length - additions.length
      publish({
        videos: [...snapshot.videos, ...additions],
        selectedId: snapshot.selectedId ?? additions[0]?.id ?? null,
        message: duplicateCount
          ? `${duplicateCount} duplicate ${duplicateCount === 1 ? 'link was' : 'links were'} already in the queue.`
          : '',
      })
      additions.forEach((video) => {
        void validate(video)
      })
      return true
    },
    async replaceAll(value: string) {
      const result = createRoomSchema.shape.url.safeParse(value)
      if (!result.success) {
        publish({ ...snapshot, message: result.error.issues[0].message })
        return false
      }
      const videos = getCreateRoomVideoLinks(value).map(entry)
      publish({ videos, selectedId: videos[0]?.id ?? null, message: '' })
      await Promise.all(videos.map(validate))
      return (
        snapshot.videos.length === videos.length &&
        snapshot.videos.every(
          (video, index) => video.id === videos[index].id && video.status === 'ready',
        )
      )
    },
    edit(id: string, value: string) {
      const url = value.trim()
      if (snapshot.videos.some((video) => video.id !== id && video.url === url)) {
        publish({ ...snapshot, message: 'That link is already in the queue.' })
        return false
      }
      const replacement = entry(url)
      publish({
        ...snapshot,
        videos: snapshot.videos.map((video) => (video.id === id ? replacement : video)),
        selectedId: snapshot.selectedId === id ? replacement.id : snapshot.selectedId,
        message: '',
      })
      void validate(replacement)
      return true
    },
    remove(id: string) {
      const videos = snapshot.videos.filter((video) => video.id !== id)
      publish({
        videos,
        selectedId: snapshot.selectedId === id ? (videos[0]?.id ?? null) : snapshot.selectedId,
        message: '',
      })
    },
    move(id: string, direction: -1 | 1) {
      const videos = [...snapshot.videos]
      const index = videos.findIndex((video) => video.id === id)
      const destination = index + direction
      if (index < 0 || destination < 0 || destination >= videos.length) return
      ;[videos[index], videos[destination]] = [videos[destination], videos[index]]
      publish({ ...snapshot, videos, message: `Video moved to position ${destination + 1}.` })
    },
    select(id: string) {
      if (snapshot.videos.some((video) => video.id === id)) publish({ ...snapshot, selectedId: id })
    },
    reset() {
      cache.clear()
      publish({ videos: [], selectedId: null, message: '' })
    },
  }
}
