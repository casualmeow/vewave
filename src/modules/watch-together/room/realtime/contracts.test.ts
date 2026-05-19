import { describe, expect, it } from 'vitest'
import { createPlaybackCommand, parseServerRoomEvent } from './contracts'

describe('room realtime contracts', () => {
  it('parses playback.state events', () => {
    const event = parseServerRoomEvent({
      type: 'playback.state',
      payload: {
        status: 'playing',
        positionMs: 1000,
        effectivePositionMs: 1200,
        playbackRate: 1,
        version: 2,
        updatedAt: '2026-05-19T12:00:00.000Z',
        serverTimeMs: 100,
      },
    })

    expect(event?.type).toBe('playback.state')
  })

  it('rejects unknown event shapes', () => {
    expect(parseServerRoomEvent({ type: 'unknown', payload: {} })).toBeNull()
  })

  it('creates playback commands with client time', () => {
    const command = createPlaybackCommand('seek', 3000)

    expect(command.type).toBe('playback.command')
    expect(command.payload).toMatchObject({ action: 'seek', positionMs: 3000 })
    expect(command.payload.clientTimeMs).toBeGreaterThan(0)
  })
})
