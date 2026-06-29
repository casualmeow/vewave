import { describe, expect, it } from 'vitest'
import {
  createRoomSchema,
  getCreateRoomVideoLinks,
} from '@/modules/watch-together/create-room/schema/create-room-schema'

describe('createRoomSchema', () => {
  it('accepts supported video links with an optional room name', () => {
    const result = createRoomSchema.parse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/oHg5SJYRHA0',
      title: 'Movie night',
    })

    expect(result).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/oHg5SJYRHA0',
      title: 'Movie night',
    })
    expect(getCreateRoomVideoLinks(result.url)).toEqual([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/oHg5SJYRHA0',
    ])
  })

  it('rejects invalid video link input', () => {
    expect(() => createRoomSchema.parse({ url: 'not-a-url' })).toThrow()
    expect(() =>
      createRoomSchema.parse({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ\nnot-a-url',
      }),
    ).toThrow()
  })
})
