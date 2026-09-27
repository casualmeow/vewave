import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppearanceContextValue, AppearanceSettings } from '@/shared/theme'
import { patchApiProfileMe } from '@/core/api/generated/profile/profile'
import { useAccountAppearanceSave } from '@/modules/appearance/use-account-appearance-save'
import { AuthBootstrap } from '@/modules/auth/components/auth-bootstrap'
import { useAuthStore } from '@/modules/auth/model'
import {
  AppThemeProvider,
  defaultAppearanceSettings,
  sanitizeAppearanceSettings,
  useAppearance,
} from '@/shared/theme'

vi.mock('@/core/api/generated/profile/profile', () => ({
  patchApiProfileMe: vi.fn(),
  getGetApiProfileMeQueryKey: () => ['/api/profile/me'],
}))
vi.mock('@/modules/auth/hooks', () => ({ useAuthBootstrap: vi.fn() }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

const saved = sanitizeAppearanceSettings(defaultAppearanceSettings)
const user = (id: string, appearance: AppearanceSettings = saved) => ({
  id,
  name: id,
  email: `${id}@example.com`,
  username: null,
  avatarUrl: null,
  bio: null,
  isAdmin: false,
  appConfig: { appearance, unrelated: { keep: true } },
})
let appearance: AppearanceContextValue
function Probe() {
  appearance = useAppearance()
  return null
}
function Saver() {
  const { status, retry } = useAccountAppearanceSave()
  return <button onClick={retry}>{status}</button>
}
function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Tree({ open }: { open: boolean }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AuthBootstrap>
            <Probe />
            {open && <Saver />}
          </AuthBootstrap>
        </AppThemeProvider>
      </QueryClientProvider>
    )
  }
  const view = render(<Tree open />)
  return { ...view, setOpen: (open: boolean) => view.rerender(<Tree open={open} />) }
}
const settle = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  vi.mocked(patchApiProfileMe).mockResolvedValue(
    {} as Awaited<ReturnType<typeof patchApiProfileMe>>,
  )
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
  })
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  useAuthStore.getState().setAuthenticated(user('a'), 'token-a')
})
afterEach(async () => {
  act(() => useAuthStore.getState().reset())
  cleanup()
  await vi.advanceTimersByTimeAsync(0)
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('account appearance autosave', () => {
  it('saves theme and background together, coalesces slider edits, and keeps unrelated account config', async () => {
    setup()
    expect(appearance.accountId).toBe('a')
    act(() => {
      appearance.setPreset('heatwave')
      appearance.setBackground({ preset: 'silk', brightness: 0.4 })
      appearance.setBackground({ brightness: 0.35 })
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    expect(vi.mocked(patchApiProfileMe).mock.calls[0][0]).toMatchObject({
      appConfig: {
        unrelated: { keep: true },
        appearance: { preset: 'heatwave', background: { preset: 'silk', brightness: 0.35 } },
      },
    })
    expect(useAuthStore.getState().user?.appConfig?.appearance).toEqual(appearance.settings)
    expect(screen.getByRole('button').textContent).toBe('saved')
  })

  it('flushes on close and preserves write order across a quick reopen', async () => {
    let finish!: (result: Awaited<ReturnType<typeof patchApiProfileMe>>) => void
    vi.mocked(patchApiProfileMe).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const view = setup()
    act(() => appearance.setPreset('heatwave'))
    view.setOpen(false)
    await settle()
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    view.setOpen(true)
    act(() => appearance.setPreset('coldwave'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    finish({} as Awaited<ReturnType<typeof patchApiProfileMe>>)
    await settle()
    expect(
      vi.mocked(patchApiProfileMe).mock.calls.map(([body]) => body.appConfig?.appearance),
    ).toEqual([
      { ...saved, preset: 'heatwave' },
      { ...saved, preset: 'coldwave' },
    ])
    expect(appearance.settings.preset).toBe('coldwave')
    expect(screen.getByRole('button').textContent).toBe('saved')
  })

  it('aborts the outgoing account request and ignores a late response after switching accounts', async () => {
    let finish!: (result: Awaited<ReturnType<typeof patchApiProfileMe>>) => void
    vi.mocked(patchApiProfileMe).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    setup()
    act(() => appearance.setPreset('heatwave'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    const signal = vi.mocked(patchApiProfileMe).mock.calls[0][2]
    act(() => {
      appearance.setBackground({ preset: 'silk' })
      useAuthStore
        .getState()
        .setAuthenticated(user('b', { ...saved, preset: 'darkwave' }), 'token-b')
    })
    expect(signal?.aborted).toBe(true)
    expect(appearance.accountId).toBe('b')
    expect(appearance.settings.preset).toBe('darkwave')
    finish({} as Awaited<ReturnType<typeof patchApiProfileMe>>)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().user?.id).toBe('b')
    expect(useAuthStore.getState().user?.appConfig?.appearance).toMatchObject({
      preset: 'darkwave',
      background: saved.background,
    })
  })

  it('retries unsynced changes when Settings reopens after a failed save', async () => {
    vi.mocked(patchApiProfileMe).mockRejectedValueOnce(new Error('offline'))
    const view = setup()
    act(() => appearance.setPreset('heatwave'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(screen.getByRole('button').textContent).toBe('error')

    vi.mocked(patchApiProfileMe).mockRejectedValueOnce(new Error('offline'))
    view.setOpen(false)
    await settle()
    view.setOpen(true)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(patchApiProfileMe).toHaveBeenCalledTimes(3)
    expect(useAuthStore.getState().user?.appConfig?.appearance).toMatchObject({
      preset: 'heatwave',
    })
    expect(screen.getByRole('button').textContent).toBe('saved')
  })

  it('does not apply an aborted response when the same account signs in again', async () => {
    let finish!: (result: Awaited<ReturnType<typeof patchApiProfileMe>>) => void
    vi.mocked(patchApiProfileMe).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    setup()
    act(() => appearance.setPreset('heatwave'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    act(() => useAuthStore.getState().setAuthenticated(user('b'), 'token-b'))
    act(() =>
      useAuthStore
        .getState()
        .setAuthenticated(user('a', { ...saved, preset: 'coldwave' }), 'new-token-a'),
    )
    finish({} as Awaited<ReturnType<typeof patchApiProfileMe>>)
    await settle()
    expect(appearance.settings.preset).toBe('coldwave')
    expect(useAuthStore.getState().user?.appConfig?.appearance).toMatchObject({
      preset: 'coldwave',
    })
  })

  it('clears a sync error when returning to guest appearance', async () => {
    vi.mocked(patchApiProfileMe).mockRejectedValueOnce(new Error('offline'))
    setup()
    act(() => appearance.setPreset('heatwave'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(screen.getByRole('button').textContent).toBe('error')
    act(() => useAuthStore.getState().setAnonymous())
    expect(appearance.accountId).toBeNull()
    expect(screen.getByRole('button').textContent).toBe('saved')
  })

  it('never sends guest settings to an account with no saved appearance', async () => {
    useAuthStore.getState().setAnonymous()
    setup()
    act(() => {
      appearance.setPreset('heatwave')
      appearance.setBackground({ preset: 'silk' })
    })
    const newAccount = { ...user('new'), appConfig: { unrelated: { keep: true } } }
    act(() => useAuthStore.getState().setAuthenticated(newAccount, 'token-new'))
    expect(appearance.settings.preset).toBe(defaultAppearanceSettings.preset)
    expect(appearance.settings.background.preset).toBe(defaultAppearanceSettings.background.preset)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    expect(vi.mocked(patchApiProfileMe).mock.calls[0][0].appConfig?.appearance).toEqual(saved)
    act(() => useAuthStore.getState().setAnonymous())
    expect(appearance.accountId).toBeNull()
    expect(appearance.settings.preset).toBe('heatwave')
    expect(appearance.settings.background.preset).toBe('silk')
  })
})
