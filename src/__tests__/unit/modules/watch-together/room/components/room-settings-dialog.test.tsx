import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { getGetApiRoomsByCodeQueryKey } from '@/core/api/generated/rooms/rooms'
import { RoomSettingsDialog } from '@/modules/watch-together/room/components/room-settings-dialog'
import { defaultRoomPreferences, useRoomStore } from '@/modules/watch-together/room/model'

const apiMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}))

vi.mock('@/core/api/generated/rooms/rooms', () => ({
  getGetApiRoomsByCodeQueryKey: (code: string) => [`/api/rooms/${code}`],
  usePatchApiRoomsByCode: () => ({
    isPending: false,
    mutateAsync: apiMocks.mutateAsync,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

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

function renderDialog(currentSnapshot = snapshot) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(getGetApiRoomsByCodeQueryKey(currentSnapshot.room.code), currentSnapshot)
  useRoomStore.getState().hydrateSnapshot(currentSnapshot)

  render(
    <QueryClientProvider client={queryClient}>
      <RoomSettingsDialog
        open
        onOpenChange={vi.fn()}
        snapshot={currentSnapshot}
        connectionStatus="open"
        preferences={defaultRoomPreferences}
        updatePreferences={vi.fn()}
        resetPreferences={vi.fn()}
      />
    </QueryClientProvider>,
  )

  return queryClient
}

describe('RoomSettingsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    useRoomStore.getState().reset()
  })

  it('shows editable management controls to a moderator', () => {
    renderDialog()

    expect(screen.getByLabelText('Room title')).toBeTruthy()
    expect(screen.getByLabelText('Visibility')).toBeTruthy()
    expect(screen.getByLabelText('Room status')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save changes' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('Playback and synchronization')).toBeTruthy()
    expect(screen.getByText('Reset to defaults')).toBeTruthy()
  })

  it('shows room metadata read-only to a viewer', () => {
    renderDialog({
      ...snapshot,
      permissions: {
        ...snapshot.permissions,
        role: 'viewer',
        canControlPlayback: false,
        canAddMedia: false,
        canModerate: false,
      },
    })

    expect(screen.queryByLabelText('Room title')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull()
    expect(screen.getByText('Friday room')).toBeTruthy()
    expect(screen.getByText('Only the room owner or a host can edit these settings.')).toBeTruthy()
  })

  it('updates query and room state from the successful mutation response', async () => {
    const updatedRoom = { ...snapshot.room, title: 'Saturday room' }
    apiMocks.mutateAsync.mockResolvedValue({ room: updatedRoom })
    const queryClient = renderDialog()

    fireEvent.change(screen.getByLabelText('Room title'), {
      target: { value: 'Saturday room' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(apiMocks.mutateAsync).toHaveBeenCalledWith({
        code: 'ABCD',
        data: { title: 'Saturday room' },
      })
      expect(useRoomStore.getState().snapshot?.room.title).toBe('Saturday room')
    })

    const cached = queryClient.getQueryData<GetApiRoomsByCode200>(
      getGetApiRoomsByCodeQueryKey('ABCD'),
    )
    expect(cached?.room.title).toBe('Saturday room')
    expect(toast.success).toHaveBeenCalledWith('Room settings saved')
    expect(screen.getByRole('button', { name: 'Save changes' }).hasAttribute('disabled')).toBe(true)
  })
})
