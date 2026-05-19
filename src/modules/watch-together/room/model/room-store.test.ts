import { afterEach, describe, expect, it } from 'vitest'
import { initialRoomState, useRoomStore } from './room-store'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'

const snapshot: GetApiRoomsByCode200 = {
  room: {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'ABCD',
    title: 'Watch room',
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
})
