import { describe, expect, it, vi } from 'vitest'
import type { PostApiMediaParseUrl200 } from '@/core/api/generated/model'
import { createVideoQueue } from '@/modules/watch-together/create-room/model/video-queue'

const media = (url: string): PostApiMediaParseUrl200 => ({
  provider: 'youtube',
  externalId: url,
  canonicalUrl: url,
})
const first = 'https://youtu.be/first'
const second = 'https://youtu.be/second'

describe('creation video queue', () => {
  it('deduplicates multiline paste, validates each link, and preserves order', async () => {
    const parse = vi.fn((url: string) => Promise.resolve(media(url)))
    const queue = createVideoQueue(parse)
    expect(queue.add(`${first}\n${second}\n${first}`)).toBe(true)
    await vi.waitFor(() =>
      expect(queue.getSnapshot().videos.every((video) => video.status === 'ready')).toBe(true),
    )
    expect(parse).toHaveBeenCalledTimes(2)
    expect(queue.getSnapshot().message).toContain('1 duplicate')
    const videos = queue.getSnapshot().videos
    queue.select(videos[1].id)
    expect(queue.getSnapshot().videos.map((video) => video.url)).toEqual([first, second])
    queue.move(videos[1].id, -1)
    expect(queue.getSnapshot().videos.map((video) => video.url)).toEqual([second, first])
    queue.remove(videos[1].id)
    expect(queue.getSnapshot().selectedId).toBe(videos[0].id)
  })

  it('rejects batches above 20 without losing the existing queue', () => {
    const queue = createVideoQueue((url) => Promise.resolve(media(url)))
    queue.add(first)
    expect(
      queue.add(Array.from({ length: 20 }, (_, index) => `https://youtu.be/${index}`).join('\n')),
    ).toBe(false)
    expect(queue.getSnapshot().videos).toHaveLength(1)
    expect(queue.getSnapshot().message).toContain('20')
  })

  it('keeps invalid links editable and retries failed metadata requests', async () => {
    const parse = vi
      .fn((url: string) => Promise.resolve(media(url)))
      .mockRejectedValueOnce(new Error('Provider unavailable'))
    const queue = createVideoQueue(parse)
    queue.add(`not-a-url\n${first}`)
    await vi.waitFor(() =>
      expect(queue.getSnapshot().videos.every((video) => video.status === 'error')).toBe(true),
    )
    expect(parse).toHaveBeenCalledTimes(1)
    const failed = queue.getSnapshot().videos[1]
    queue.edit(failed.id, failed.url)
    await vi.waitFor(() => expect(queue.getSnapshot().videos[1].status).toBe('ready'))
    expect(parse).toHaveBeenCalledTimes(2)
  })

  it('ignores late results for removed and edited entries', async () => {
    let resolveFirst!: (value: PostApiMediaParseUrl200) => void
    const parse = vi.fn((url: string) =>
      url === first
        ? new Promise<PostApiMediaParseUrl200>((resolve) => {
            resolveFirst = resolve
          })
        : Promise.resolve(media(url)),
    )
    const queue = createVideoQueue(parse)
    queue.add(first)
    queue.edit(queue.getSnapshot().videos[0].id, second)
    resolveFirst(media(first))
    await vi.waitFor(() => expect(queue.getSnapshot().videos[0].status).toBe('ready'))
    expect(queue.getSnapshot().videos[0].media?.canonicalUrl).toBe(second)
    queue.remove(queue.getSnapshot().videos[0].id)
    await Promise.resolve()
    expect(queue.getSnapshot().videos).toEqual([])
  })

  it('reuses successful validation without accepting a stale compact-form draft', async () => {
    const parse = vi.fn((url: string) => Promise.resolve(media(url)))
    const queue = createVideoQueue(parse)
    expect(await queue.replaceAll(first)).toBe(true)
    expect(await queue.replaceAll(first)).toBe(true)
    expect(parse).toHaveBeenCalledTimes(1)
    const stale = queue.replaceAll(first)
    queue.reset()
    expect(await stale).toBe(false)
    expect(queue.getSnapshot().videos).toEqual([])
  })
})
