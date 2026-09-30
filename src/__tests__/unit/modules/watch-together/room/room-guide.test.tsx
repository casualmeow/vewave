import { StrictMode } from 'react'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRoomGuide } from '@/modules/watch-together/room/hooks/use-room-guide'
import {
  getPendingRoomGuideSave,
  markRoomGuideCreation,
  readRoomGuide,
  resetRoomGuideSession,
  saveRoomGuideProgress,
} from '@/modules/watch-together/room/model/room-guide'
import { useAuthStore } from '@/modules/auth/model'

const api = vi.hoisted(() => ({ profile: vi.fn(), save: vi.fn() }))
vi.mock('@/core/api/generated/profile/profile', () => ({
  getApiProfileMe: api.profile,
  patchApiProfileMeRoomGuide: api.save,
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

function login(id = 'viewer', appConfig: Record<string, unknown> = {}) {
  useAuthStore.getState().setAuthenticated(
    {
      id,
      name: id,
      email: `${id}@example.com`,
      username: null,
      avatarUrl: null,
      bio: null,
      isAdmin: false,
      appConfig,
    },
    'token',
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  })
  resetRoomGuideSession()
  login()
  api.profile.mockResolvedValue({
    profile: { appConfig: { roomGuide: { version: 1, status: 'pending' } } },
  })
  api.save.mockImplementation(({ status }: { status: string }) =>
    Promise.resolve({
      roomGuide: { version: 1, status },
    }),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('account room guidance', () => {
  it('starts only after a created room is ready, including Strict Mode remount effects', async () => {
    markRoomGuideCreation('viewer', 'ABCD')
    const { result, rerender } = renderHook(({ ready }) => useRoomGuide('ABCD', ready), {
      initialProps: { ready: false },
      wrapper: StrictMode,
    })
    expect(result.current.step).toBeNull()
    expect(api.profile).not.toHaveBeenCalled()
    rerender({ ready: true })
    await waitFor(() => expect(result.current.step).toBe(0))
    act(() => result.current.close('completed'))
    await waitFor(() =>
      expect(readRoomGuide(useAuthStore.getState().user?.appConfig)?.status).toBe('completed'),
    )
    expect(api.save).toHaveBeenCalledTimes(1)
  })

  it('does not automatically guide existing accounts or people joining rooms', async () => {
    const { result, unmount } = renderHook(() => useRoomGuide('ABCD', true))
    expect(api.profile).not.toHaveBeenCalled()
    act(() => result.current.start())
    expect(result.current.step).toBe(0)
    act(() => result.current.close())
    await waitFor(() => expect(api.save).toHaveBeenCalled())
    unmount()
    api.profile.mockResolvedValue({ profile: { appConfig: {} } })
    markRoomGuideCreation('viewer', 'NEXT')
    const existing = renderHook(() => useRoomGuide('NEXT', true))
    await waitFor(() => expect(api.profile).toHaveBeenCalledTimes(1))
    expect(existing.result.current.step).toBeNull()
  })

  it('respects a completion saved on another device', async () => {
    api.profile.mockResolvedValue({
      profile: { appConfig: { roomGuide: { version: 1, status: 'completed' } } },
    })
    markRoomGuideCreation('viewer', 'ABCD')
    const { result } = renderHook(() => useRoomGuide('ABCD', true))
    await waitFor(() => expect(api.profile).toHaveBeenCalled())
    expect(result.current.step).toBeNull()
  })

  it('retains failed progress locally, retries, and preserves appearance', async () => {
    login('viewer', { appearance: { preset: 'pearl' }, unrelated: 42 })
    api.save.mockRejectedValueOnce(new Error('Offline'))
    await expect(saveRoomGuideProgress('viewer', 'dismissed')).rejects.toThrow('Offline')
    expect(getPendingRoomGuideSave('viewer')).toBe('dismissed')
    markRoomGuideCreation('viewer', 'ABCD')
    const { result } = renderHook(() => useRoomGuide('ABCD', true))
    await waitFor(() => expect(getPendingRoomGuideSave('viewer')).toBeNull())
    expect(api.profile).not.toHaveBeenCalled()
    expect(result.current.step).toBeNull()
    expect(useAuthStore.getState().user?.appConfig).toEqual({
      appearance: { preset: 'pearl' },
      unrelated: 42,
      roomGuide: { version: 1, status: 'dismissed' },
    })
  })

  it('does not apply stale profile responses after switching accounts', async () => {
    let resolve!: (value: unknown) => void
    api.profile.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    markRoomGuideCreation('viewer', 'ABCD')
    const { result } = renderHook(() => useRoomGuide('ABCD', true))
    await act(async () => {
      login('second')
      resolve({ profile: { appConfig: { roomGuide: { version: 1, status: 'pending' } } } })
      await Promise.resolve()
    })
    expect(result.current.step).toBeNull()
    expect(useAuthStore.getState().user?.id).toBe('second')
  })

  it('treats missing, malformed, or newer guide records as manual-only', () => {
    for (const value of [
      undefined,
      {},
      { roomGuide: null },
      { roomGuide: { version: 2, status: 'pending' } },
      { roomGuide: { version: 1, status: 'unknown' } },
    ])
      expect(readRoomGuide(value)).toBeNull()
  })
})
