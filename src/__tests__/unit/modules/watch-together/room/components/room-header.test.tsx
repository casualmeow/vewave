import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { RoomHeader } from '@/modules/watch-together/room/components/room-header'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

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
    externalId: 'video-1',
    canonicalUrl: 'https://example.com/source-video',
    title: 'Source title',
  },
  mediaItems: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      position: 0,
      provider: 'youtube',
      externalId: 'video-1',
      canonicalUrl: 'https://example.com/source-video',
      title: 'Source title',
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

describe('RoomHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/room/ABCD')

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('copies the current room link from the share action', async () => {
    render(<RoomHeader snapshot={snapshot} connectionStatus="closed" />)

    fireEvent.click(screen.getByRole('button', { name: /share room/i }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href)
    })
    expect(toast.success).toHaveBeenCalledWith('Room link copied')
  })

  it('keeps the source video link available', () => {
    render(<RoomHeader snapshot={snapshot} connectionStatus="closed" />)

    expect(screen.getByRole('link', { name: /source video/i }).getAttribute('href')).toBe(
      snapshot.media.canonicalUrl,
    )
  })
})
