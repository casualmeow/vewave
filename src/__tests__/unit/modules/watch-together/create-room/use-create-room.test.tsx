import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateRoom } from '@/modules/watch-together/create-room/hooks/use-create-room'
import { useAuthStore } from '@/modules/auth/model'
import { resetRoomGuideSession } from '@/modules/watch-together/room/model/room-guide'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  create: vi.fn(),
  parse: vi.fn(),
  remember: vi.fn(),
}))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mocks.navigate }))
vi.mock('@/core/api/generated/rooms/rooms', () => ({ postApiRooms: mocks.create }))
vi.mock('@/core/api/generated/media/media', () => ({ postApiMediaParseUrl: mocks.parse }))
vi.mock('@/modules/watch-together/room/model/saved-rooms', () => ({
  rememberCreatedRoom: mocks.remember,
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function login(id: string) {
  useAuthStore.getState().setAuthenticated(
    {
      id,
      name: id,
      email: `${id}@example.com`,
      username: null,
      avatarUrl: null,
      bio: null,
      isAdmin: false,
    },
    'token',
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  resetRoomGuideSession()
  login('first')
  mocks.parse.mockImplementation(({ url }: { url: string }) =>
    Promise.resolve({
      provider: 'youtube',
      externalId: 'video',
      canonicalUrl: url,
    }),
  )
  mocks.create.mockResolvedValue({ room: { code: 'ABCD' } })
  mocks.navigate.mockResolvedValue(undefined)
})
afterEach(cleanup)

describe('shared room creation', () => {
  it('retries opening a created room without creating or applying preferences twice', async () => {
    mocks.navigate.mockRejectedValueOnce(new Error('Navigation failed'))
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateRoom())
    act(() => {
      result.current.queue.add('https://youtu.be/first')
    })
    await waitFor(() => expect(result.current.draft.videos[0].status).toBe('ready'))
    await act(async () => {
      await result.current.submit('Friday', onSuccess)
    })
    expect(result.current.phase).toBe('created')
    expect(result.current.error).toContain('was created')
    await act(async () => {
      await result.current.submit('Friday', onSuccess)
    })
    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(mocks.navigate).toHaveBeenCalledTimes(2)
  })

  it('retains the draft on API failure and prevents concurrent submissions', async () => {
    let reject!: (error: Error) => void
    mocks.create.mockImplementation(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail
        }),
    )
    const { result } = renderHook(() => useCreateRoom())
    act(() => {
      result.current.queue.add('https://youtu.be/first')
    })
    await waitFor(() => expect(result.current.draft.videos[0].status).toBe('ready'))
    await act(async () => {
      const first = result.current.submit('Friday')
      expect(await result.current.submit('Friday')).toBe(false)
      reject(new Error('Offline'))
      await first
    })
    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(result.current.draft.videos).toHaveLength(1)
    expect(result.current.phase).toBe('idle')
  })

  it('does not navigate or apply preferences when the account changes during creation', async () => {
    let resolve!: (room: unknown) => void
    mocks.create.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const apply = vi.fn()
    const { result } = renderHook(() => useCreateRoom())
    act(() => {
      result.current.queue.add('https://youtu.be/first')
    })
    await waitFor(() => expect(result.current.draft.videos[0].status).toBe('ready'))
    await act(async () => {
      const request = result.current.submit('Friday', apply)
      login('second')
      resolve({ room: { code: 'ABCD' } })
      await request
    })
    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(apply).not.toHaveBeenCalled()
    expect(result.current.draft.videos).toEqual([])
  })
})
