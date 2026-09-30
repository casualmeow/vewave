import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateRoomPage } from '@/modules/watch-together/create-room/components/create-room-page'
import { useAuthStore } from '@/modules/auth/model'

const api = vi.hoisted(() => ({ parse: vi.fn(), create: vi.fn(), navigate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => api.navigate }))
vi.mock('@/core/api/generated/media/media', () => ({ postApiMediaParseUrl: api.parse }))
vi.mock('@/core/api/generated/rooms/rooms', () => ({ postApiRooms: api.create }))
vi.mock('@/modules/watch-together/room/model/saved-rooms', () => ({ rememberCreatedRoom: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

let storage: Map<string, string>
let accountSequence = 0
beforeEach(() => {
  vi.resetAllMocks()
  storage = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  )
  useAuthStore.getState().setAuthenticated(
    {
      id: `page-${++accountSequence}`,
      name: 'Viewer',
      email: 'viewer@example.com',
      username: null,
      avatarUrl: null,
      bio: null,
      isAdmin: false,
    },
    'token',
  )
  api.parse.mockImplementation(({ url }: { url: string }) =>
    Promise.resolve({
      provider: 'youtube',
      canonicalUrl: url,
      externalId: 'first',
      title: 'A video to watch',
    }),
  )
  api.create.mockResolvedValue({ room: { code: 'ABCD' } })
  api.navigate.mockResolvedValue(undefined)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('creation workspace', () => {
  it('previews personal preferences without saving them until creation succeeds', async () => {
    render(<CreateRoomPage />)
    const start = screen.getByRole<HTMLButtonElement>('button', { name: 'Start room' })
    expect(start.disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Workspace' }))
    fireEvent.click(screen.getByRole('button', { name: 'cinema' }))
    expect([...storage.keys()].some((key) => key.includes('room-preferences'))).toBe(false)
    fireEvent.change(screen.getByLabelText('Add videos'), {
      target: { value: 'https://youtu.be/first' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(start.disabled).toBe(false))
    expect(screen.getByRole('region', { name: 'Room preview' })).toBeDefined()
    fireEvent.click(start)
    await waitFor(() => expect(api.navigate).toHaveBeenCalled())
    const saved = [...storage.entries()].find(([key]) => key.includes('room-preferences'))
    expect(JSON.parse(saved![1])).toMatchObject({
      viewMode: 'workspace',
      workspacePreset: 'cinema',
    })
  })

  it('shows provider limitations and requires pasted links to be added before starting', async () => {
    api.parse.mockResolvedValue({
      provider: 'vimeo',
      externalId: '1234',
      canonicalUrl: 'https://vimeo.com/1234',
    })
    render(<CreateRoomPage />)
    fireEvent.change(screen.getByLabelText('Add videos'), {
      target: { value: 'https://vimeo.com/1234' },
    })
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Start room' }).disabled).toBe(
      true,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() =>
      expect(screen.getByText(/In-room playback is not available yet/)).toBeDefined(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'How it works' }))
    expect(screen.getByText('3. Invite friends.')).toBeDefined()
  })
})
