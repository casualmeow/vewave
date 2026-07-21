import { describe, expect, it } from 'vitest'
import {
  createMediaAddCommand,
  createMediaRemoveCommand,
  createMediaRenameCommand,
  createMediaSelectCommand,
  createPlaybackCommand,
  parseServerRoomEvent,
} from '@/modules/watch-together/room/realtime/contracts'

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

  it('parses snapshot events with canonical presence object', () => {
    const event = parseServerRoomEvent({
      type: 'room.snapshot',
      payload: {
        room: { code: 'ABCD' },
        media: {
          provider: 'youtube',
          externalId: 'dQw4w9WgXcQ',
          canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        mediaItems: [
          {
            id: 'item-1',
            position: 0,
            provider: 'youtube',
            externalId: 'dQw4w9WgXcQ',
            canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          },
        ],
        playback: {
          status: 'paused',
          positionMs: 0,
          effectivePositionMs: 0,
          playbackRate: 1,
          version: 1,
          updatedAt: '2026-05-19T12:00:00.000Z',
          serverTimeMs: 100,
        },
        permissions: { role: 'owner', canControlPlayback: true },
        presence: {
          members: [
            {
              connectionId: 'conn-1',
              memberId: 'member-1',
              userId: 'user-1',
              name: 'Jane',
              role: 'owner',
            },
          ],
        },
      },
    })

    expect(event?.type).toBe('room.snapshot')
    if (event?.type === 'room.snapshot') {
      expect(event.payload.presence?.members[0]?.connectionId).toBe('conn-1')
      expect(event.payload.mediaItems[0]?.thumbnailUrl).toContain('hqdefault.jpg')
    }
  })

  it('parses joined and left presence events', () => {
    const member = {
      connectionId: 'conn-1',
      memberId: 'member-1',
      userId: 'user-1',
      name: 'Jane',
      role: 'host',
    }

    const joined = parseServerRoomEvent({
      type: 'presence.member.joined',
      payload: { member, members: [member] },
    })
    const left = parseServerRoomEvent({
      type: 'presence.member.left',
      payload: {
        connectionId: 'conn-1',
        memberId: 'member-1',
        userId: 'user-1',
        members: [],
      },
    })

    expect(joined?.type).toBe('presence.member.joined')
    if (joined?.type === 'presence.member.joined') {
      expect(joined.payload.members).toHaveLength(1)
    }
    expect(left?.type).toBe('presence.member.left')
    if (left?.type === 'presence.member.left') {
      expect(left.payload.members).toHaveLength(0)
    }
  })

  it('parses command rejection payloads from the backend', () => {
    const event = parseServerRoomEvent({
      type: 'command.rejected',
      payload: {
        code: 'PLAYBACK_COMMAND_FORBIDDEN',
        message: 'Only the room host can control playback.',
      },
    })

    expect(event?.type).toBe('command.rejected')
    if (event?.type === 'command.rejected') {
      expect(event.payload.message).toContain('host')
    }
  })

  it('rejects unknown event shapes', () => {
    expect(parseServerRoomEvent({ type: 'unknown', payload: {} })).toBeNull()
  })

  it('creates media queue commands', () => {
    expect(createMediaSelectCommand('item-1')).toEqual({
      type: 'media.select',
      payload: { mediaItemId: 'item-1' },
    })
    expect(createMediaAddCommand('https://youtu.be/oHg5SJYRHA0')).toEqual({
      type: 'media.add',
      payload: { url: 'https://youtu.be/oHg5SJYRHA0' },
    })
    expect(createMediaRenameCommand('item-1', 'Friday mix')).toEqual({
      type: 'media.rename',
      payload: { mediaItemId: 'item-1', title: 'Friday mix' },
    })
    expect(createMediaRemoveCommand('item-1')).toEqual({
      type: 'media.remove',
      payload: { mediaItemId: 'item-1' },
    })
  })

  it('creates playback commands with client time', () => {
    const command = createPlaybackCommand('seek', 3000)

    expect(command.type).toBe('playback.command')
    if (command.type === 'playback.command') {
      expect(command.payload).toMatchObject({ action: 'seek', positionMs: 3000 })
      expect(command.payload.clientTimeMs).toBeGreaterThan(0)
    }
  })
})
