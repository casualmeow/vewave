import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  readSavedRooms,
  rememberCreatedRoom,
  rememberRoomSnapshot,
  rememberSavedRoom,
} from './saved-rooms'
import type { GetApiRoomsByCode200, PostApiRooms200 } from '@/core/api/generated/model'

const storagePrefix = 'vewave:saved-rooms:v1'

function createStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key)
    },
    setItem: (key, value) => {
      store.set(key, value)
    },
  }
}

function clearSavedRoomStorage() {
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index)

    if (key?.startsWith(storagePrefix)) {
      window.localStorage.removeItem(key)
    }
  }
}

const createdRoom: PostApiRooms200 = {
  room: {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'Host1aB2cD',
    title: 'Host room',
    visibility: 'private',
    status: 'active',
    createdAt: '2026-05-19T12:00:00.000Z',
    endedAt: null,
  },
  media: {
    provider: 'youtube',
    externalId: 'video-1',
    canonicalUrl: 'https://example.com/video-1',
    title: 'Parsed video',
    thumbnailUrl: 'https://i.ytimg.com/vi/video-1/hqdefault.jpg',
  },
  mediaItems: [
    {
      id: '33333333-3333-3333-3333-333333333333',
      position: 0,
      provider: 'youtube',
      externalId: 'video-1',
      canonicalUrl: 'https://example.com/video-1',
      title: 'Parsed video',
      thumbnailUrl: 'https://i.ytimg.com/vi/video-1/hqdefault.jpg',
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
}

const loadedRoom: GetApiRoomsByCode200 = {
  room: {
    id: '22222222-2222-2222-2222-222222222222',
    code: 'VIEW2',
    title: null,
    visibility: 'unlisted',
    status: 'active',
    createdAt: '2026-05-20T12:00:00.000Z',
    endedAt: null,
  },
  media: {
    provider: 'vimeo',
    externalId: 'video-2',
    canonicalUrl: 'https://example.com/video-2',
    title: 'Loaded video',
    thumbnailUrl: 'https://example.com/video-2.jpg',
  },
  mediaItems: [
    {
      id: '44444444-4444-4444-4444-444444444444',
      position: 0,
      provider: 'vimeo',
      externalId: 'video-2',
      canonicalUrl: 'https://example.com/video-2',
      title: 'Loaded video',
      thumbnailUrl: 'https://example.com/video-2.jpg',
    },
  ],
  playback: {
    status: 'playing',
    positionMs: 10,
    effectivePositionMs: 10,
    playbackRate: 1,
    version: 2,
    updatedAt: '2026-05-20T12:00:00.000Z',
    serverTimeMs: 200,
  },
  permissions: {
    role: 'viewer',
    canControlPlayback: false,
  },
}

describe('saved rooms', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorageMock(),
    })
  })

  afterEach(() => {
    clearSavedRoomStorage()
  })

  it('keeps guest and authenticated room history separate', () => {
    rememberSavedRoom(null, {
      code: 'GUEST1',
      title: 'Guest room',
      lastOpenedAt: '2026-05-21T12:00:00.000Z',
    })
    rememberSavedRoom('user-1', {
      code: 'USER1',
      title: 'User room',
      lastOpenedAt: '2026-05-22T12:00:00.000Z',
    })

    expect(readSavedRooms(null).map((room) => room.code)).toEqual(['GUEST1'])
    expect(readSavedRooms('user-1').map((room) => room.code)).toEqual(['USER1'])
  })

  it('preserves exact room codes and deduplicates old uppercased entries', () => {
    rememberSavedRoom('user-1', {
      code: 'room1aB2cD',
      title: 'First title',
      lastOpenedAt: '2026-05-21T12:00:00.000Z',
    })
    rememberSavedRoom('user-1', {
      code: 'ROOM2',
      title: 'Second room',
      thumbnailUrls: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
      videoCount: 2,
      lastOpenedAt: '2026-05-22T12:00:00.000Z',
    })
    rememberSavedRoom('user-1', {
      code: 'Room1Ab2Cd',
      title: 'Updated title',
      lastOpenedAt: '2026-05-23T12:00:00.000Z',
    })

    expect(readSavedRooms('user-1')).toMatchObject([
      { code: 'Room1Ab2Cd', title: 'Updated title' },
      {
        code: 'ROOM2',
        title: 'Second room',
        thumbnailUrls: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
        videoCount: 2,
      },
    ])
  })

  it('maps created rooms as owner history', () => {
    rememberCreatedRoom(createdRoom, 'user-1')

    expect(readSavedRooms('user-1')[0]).toMatchObject({
      code: 'Host1aB2cD',
      title: 'Host room',
      role: 'owner',
      status: 'active',
      visibility: 'private',
      provider: 'youtube',
      mediaTitle: 'Parsed video',
      mediaUrl: 'https://example.com/video-1',
      thumbnailUrl: 'https://i.ytimg.com/vi/video-1/hqdefault.jpg',
      thumbnailUrls: ['https://i.ytimg.com/vi/video-1/hqdefault.jpg'],
      videoCount: 1,
    })
  })

  it('maps loaded room snapshots from current permissions', () => {
    rememberRoomSnapshot(loadedRoom, 'user-1')

    expect(readSavedRooms('user-1')[0]).toMatchObject({
      code: 'VIEW2',
      title: 'Loaded video',
      role: 'viewer',
      status: 'active',
      visibility: 'unlisted',
      provider: 'vimeo',
      mediaTitle: 'Loaded video',
      mediaUrl: 'https://example.com/video-2',
      thumbnailUrl: 'https://example.com/video-2.jpg',
      thumbnailUrls: ['https://example.com/video-2.jpg'],
      videoCount: 1,
    })
  })
})
