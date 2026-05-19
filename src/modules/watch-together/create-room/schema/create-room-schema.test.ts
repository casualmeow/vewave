import { describe, expect, it } from 'vitest'
import { createRoomSchema } from './create-room-schema'

describe('createRoomSchema', () => {
  it('accepts a supported URL-shaped input with an optional title', () => {
    const result = createRoomSchema.parse({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Movie night',
    })

    expect(result).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Movie night',
    })
  })

  it('rejects invalid URL input', () => {
    expect(() => createRoomSchema.parse({ url: 'not-a-url' })).toThrow()
  })
})
