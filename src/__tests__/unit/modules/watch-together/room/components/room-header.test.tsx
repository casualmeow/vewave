import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { RoomHeader } from '@/modules/watch-together/room/components/room-header'
import roomPageSource from '@/modules/watch-together/room/components/room-page.tsx?raw'

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
    canAddMedia: true,
    canChat: true,
    canModerate: true,
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

  function renderHeader() {
    return render(
      <RoomHeader
        snapshot={snapshot}
        participantCount={2}
        viewMode="workspace"
        onViewModeChange={vi.fn()}
        onOpenSettings={vi.fn()}
        onOpenPeople={vi.fn()}
      />,
    )
  }

  it('opens the invite popover and copies the room link', async () => {
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /invite/i }))

    const copyButton = await screen.findByRole('button', { name: /copy link/i })
    fireEvent.click(copyButton)

    const expectedUrl = `${window.location.origin}/room/${snapshot.room.code}`

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl)
    })
    expect(toast.success).toHaveBeenCalledWith('Room link copied')
  })

  it('keeps the source video link available in the room menu', async () => {
    renderHeader()

    fireEvent.keyDown(screen.getByRole('button', { name: /room menu/i }), { key: 'Enter' })

    const link = await screen.findByRole('menuitem', { name: /source video/i })
    expect(link.getAttribute('href')).toBe(snapshot.media.canonicalUrl)
  })

  it('keeps playback and synchronization status out of room identity overlays', () => {
    renderHeader()

    expect(screen.queryByText('Friday room')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByText(/paused|playing|syncing/i)).toBeNull()
    expect(roomPageSource).not.toContain('RoomSyncBadge')
    expect(roomPageSource).not.toContain('const title = snapshot.room.title')
  })
})
