import { afterEach, describe, expect, it } from 'vitest'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { initialRoomState, useRoomStore } from '@/modules/watch-together/room/model/room-store'

const snapshot: GetApiRoomsByCode200 = {
  room: {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'ABCD',
    title: 'Friday room',
    visibility: 'unlisted',
    status: 'active',
    createdAt: '2026-05-19T12:00:00.000Z',
    endedAt: null,
  },
  media: {
    provider: 'youtube',
    externalId: 'dQw4w9WgXcQ',
    canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  mediaItems: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      position: 0,
      provider: 'youtube',
      externalId: 'dQw4w9WgXcQ',
      canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
  permissions: {
    role: 'host',
    canControlPlayback: true,
  },
}

describe('room store', () => {
  afterEach(() => {
    useRoomStore.setState(initialRoomState)
  })

  it('hydrates a REST snapshot', () => {
    useRoomStore.getState().hydrateSnapshot(snapshot)

    expect(useRoomStore.getState().snapshot?.room.code).toBe('ABCD')
    expect(useRoomStore.getState().playback?.status).toBe('paused')
  })

  it('applies realtime playback state updates', () => {
    useRoomStore.getState().hydrateSnapshot(snapshot)
    useRoomStore.getState().applyServerEvent({
      type: 'playback.state',
      payload: {
        ...snapshot.playback,
        status: 'playing',
        effectivePositionMs: 1500,
        positionMs: 1500,
        version: 2,
      },
    })

    expect(useRoomStore.getState().playback).toMatchObject({
      status: 'playing',
      effectivePositionMs: 1500,
      version: 2,
    })
  })

  it('hydrates presence from realtime snapshots', () => {
    useRoomStore.getState().applyServerEvent({
      type: 'room.snapshot',
      payload: {
        ...snapshot,
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

    expect(useRoomStore.getState().presence).toEqual([
      expect.objectContaining({ connectionId: 'conn-1', name: 'Jane' }),
    ])
  })

  it('applies joined and left presence member lists', () => {
    const jane = {
      connectionId: 'conn-1',
      memberId: 'member-1',
      userId: 'user-1',
      name: 'Jane',
      role: 'owner',
    }
    const sam = {
      connectionId: 'conn-2',
      memberId: 'member-2',
      userId: 'user-2',
      name: 'Sam',
      role: 'viewer',
    }

    useRoomStore.getState().applyServerEvent({
      type: 'presence.member.joined',
      payload: { member: sam, members: [jane, sam] },
    })

    expect(useRoomStore.getState().presence).toHaveLength(2)

    useRoomStore.getState().applyServerEvent({
      type: 'presence.member.left',
      payload: {
        connectionId: 'conn-2',
        memberId: 'member-2',
        userId: 'user-2',
        members: [jane],
      },
    })

    expect(useRoomStore.getState().presence).toEqual([jane])
  })

  it('stores command rejection messages', () => {
    useRoomStore.getState().applyServerEvent({
      type: 'command.rejected',
      payload: {
        code: 'PLAYBACK_COMMAND_FORBIDDEN',
        message: 'Only the room host can control playback.',
      },
    })

    expect(useRoomStore.getState().lastError).toBe('Only the room host can control playback.')
  })
})
