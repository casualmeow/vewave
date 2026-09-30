import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { AppearanceContextValue, AppearanceSettings, UserAppConfig } from '@/shared/theme'
import { AppearanceColorStudioPage } from '@/modules/appearance/components/appearance-panel'
import { AuthBootstrap } from '@/modules/auth/components/auth-bootstrap'
import { useAuthStore } from '@/modules/auth/model'
import {
  AppThemeProvider,
  defaultAppearanceSettings,
  resolveThemeTokens,
  sanitizeAppearanceSettings,
  useAppearance,
} from '@/shared/theme'

const { saveRequest } = vi.hoisted(() => ({ saveRequest: vi.fn() }))
vi.mock('@/core/api/generated/profile/profile', () => ({
  getGetApiProfileMeQueryKey: () => ['/api/profile/me'],
  usePatchApiProfileMe: () => useMutation({ mutationFn: saveRequest }),
}))
vi.mock('@/modules/auth/hooks', () => ({ useAuthBootstrap: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@/modules/appearance/components/background-settings-controls', () => ({
  BackgroundSettingsControls: () => <div data-testid="background-controls" />,
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

const saved = sanitizeAppearanceSettings({ ...defaultAppearanceSettings, mode: 'light' })
const account = (id: string, appearance: AppearanceSettings = saved) => ({
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

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Tree({ open }: { open: boolean }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AuthBootstrap>
            <Probe />
            {open && <AppearanceColorStudioPage />}
          </AuthBootstrap>
        </AppThemeProvider>
      </QueryClientProvider>
    )
  }
  const view = render(<Tree open />)
  return { ...view, setOpen: (open: boolean) => view.rerender(<Tree open={open} />) }
}

beforeEach(() => {
  vi.clearAllMocks()
  saveRequest.mockReset()
  saveRequest.mockImplementation(({ data }: { data: { appConfig: UserAppConfig } }) =>
    Promise.resolve({ profile: { appConfig: data.appConfig } }),
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
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  useAuthStore.getState().setAuthenticated(account('a'), 'token-a')
})
afterEach(() => {
  cleanup()
  useAuthStore.getState().reset()
  vi.unstubAllGlobals()
})

describe('color studio', () => {
  it('labels the display controls and only mounts background controls when expanded', async () => {
    setup()
    expect(screen.getByRole('combobox', { name: 'Interface mode' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Surface style' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Logo variant' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Editing' })).toBeDefined()
    expect(screen.queryByRole('combobox', { name: 'Glass motion' })).toBeNull()
    expect(screen.queryByTestId('background-controls')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Background/ }))
    expect(screen.getByTestId('background-controls')).toBeDefined()
    act(() => appearance.setSurfaceStyle('glass'))
    expect(screen.getByRole('combobox', { name: 'Glass intensity' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Glass motion' })).toBeDefined()
    await act(() => Promise.resolve())
  })

  it('selects a preset once and saves it with the existing background and unrelated account data', async () => {
    setup()
    act(() => appearance.setBackground({ preset: 'silk', brightness: 0.2 }))
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    expect(screen.getByRole('button', { name: 'Mono' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('Unsaved changes')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'))
    expect(saveRequest).toHaveBeenCalledTimes(1)
    expect(saveRequest.mock.calls[0][0]).toMatchObject({
      data: {
        appConfig: {
          unrelated: { keep: true },
          appearance: { preset: 'noir', background: { preset: 'silk', brightness: 0.2 } },
        },
      },
    })
  })

  it('lets a six-digit color be typed without expanding the three-digit intermediate value', async () => {
    setup()
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Canvas hex value' })
    fireEvent.change(input, { target: { value: '#123' } })
    expect(input.value).toBe('#123')
    fireEvent.change(input, { target: { value: '#123abc' } })
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save changes' }).disabled).toBe(
      false,
    )
    fireEvent.blur(input)
    expect(input.value).toBe('#123ABC')
    expect(appearance.settings.customTheme.overrides.light?.background).toBe('#123ABC')
    expect(appearance.settings.customTheme.enabled).toBe(true)
    const sample = within(screen.getByRole('complementary', { name: 'Color preview' })).getByText(
      'Canvas text',
    )
    expect(sample.parentElement?.textContent).toContain('Low')
    fireEvent.click(screen.getByRole('button', { name: 'Reset Canvas' }))
    expect(appearance.settings.customTheme.overrides.light?.background).toBeUndefined()
    expect(input.value).toBe(resolveThemeTokens(saved, 'light').background)
    await act(() => Promise.resolve())
  })

  it('keeps Pearl available as a palette and leaves the White Glass action in Settings', () => {
    setup()
    expect(screen.queryByRole('button', { name: 'Apply White Glass' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pearl' }))
    expect(appearance.settings.preset).toBe('pearl')
    expect(appearance.settings.surfaceStyle).toBe(saved.surfaceStyle)
    expect(appearance.settings.mode).toBe(saved.mode)
  })

  it('keeps invalid input visible, blocks saving it, and lets Escape restore the active color', async () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Canvas hex value' })
    const activeColor = input.value
    fireEvent.change(input, { target: { value: '#nope' } })
    fireEvent.blur(input)
    expect(input.value).toBe('#nope')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.validity.valid).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(saveRequest).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe(activeColor)
    expect(screen.queryByRole('alert')).toBeNull()
    await act(() => Promise.resolve())
  })

  it('shows the active preset colors when custom colors are off and keeps the edits for later', async () => {
    setup()
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Canvas hex value' })
    fireEvent.change(input, { target: { value: '#123456' } })
    fireEvent.blur(input)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Use custom colors' }))
    expect(input.value).toBe(resolveThemeTokens(saved, 'light').background)
    expect(appearance.settings.customTheme.overrides.light?.background).toBe('#123456')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Use custom colors' }))
    expect(input.value).toBe('#123456')
    await act(() => Promise.resolve())
  })

  it('opens a color group with the keyboard and preserves the hidden group’s edits', async () => {
    setup()
    const input = screen.getByRole('textbox', { name: 'Canvas hex value' })
    fireEvent.change(input, { target: { value: '#abcdef' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Actions' }), { key: 'Enter' })
    expect(screen.getByRole('tab', { name: 'Actions' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.queryByRole('textbox', { name: 'Canvas hex value' })).toBeNull()
    expect(screen.getByRole('textbox', { name: 'Button text hex value' })).toBeDefined()
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Basics' }), { key: 'Enter' })
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Canvas hex value' }).value).toBe(
      '#ABCDEF',
    )
    await act(() => Promise.resolve())
  })

  it('retains newer edits when an earlier save finishes and Revert restores the saved request', async () => {
    let finish!: (result: unknown) => void
    saveRequest.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(saveRequest).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Amber' }))
    await act(() => {
      finish({ profile: { appConfig: saveRequest.mock.calls[0][0].data.appConfig } })
      return Promise.resolve()
    })
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Unsaved changes'))
    expect(appearance.settings.preset).toBe('heatwave')
    expect(useAuthStore.getState().user?.appConfig?.appearance).toMatchObject({ preset: 'noir' })
    fireEvent.click(screen.getByRole('button', { name: 'Revert' }))
    expect(appearance.settings.preset).toBe('noir')
    await act(() => Promise.resolve())
  })

  it('keeps a failed save editable and offers a retry', async () => {
    saveRequest.mockRejectedValueOnce(new Error('offline'))
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByRole('alert')
    expect(appearance.settings.preset).toBe('noir')
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'))
    expect(saveRequest).toHaveBeenCalledTimes(2)
  })

  it('still distinguishes the live draft from saved account colors after reopening', async () => {
    const view = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    view.setOpen(false)
    view.setOpen(true)
    expect(screen.getByRole('status').textContent).toBe('Unsaved changes')
    fireEvent.click(screen.getByRole('button', { name: 'Revert' }))
    expect(appearance.settings.preset).toBe(saved.preset)
    await act(() => Promise.resolve())
  })

  it('clears invalid field text when reverting unrelated unsaved settings', async () => {
    setup()
    act(() => appearance.setBackground({ preset: 'silk' }))
    const input = screen.getByRole('textbox', { name: 'Canvas hex value' })
    fireEvent.change(input, { target: { value: '#invalid' } })
    fireEvent.blur(input)
    fireEvent.click(screen.getByRole('button', { name: 'Revert' }))
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Canvas hex value' }).value).toBe(
      resolveThemeTokens(saved, 'light').background,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    await act(() => Promise.resolve())
  })

  it('records a completed save for the same account after leaving the editor', async () => {
    let finish!: (result: unknown) => void
    saveRequest.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const view = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(saveRequest).toHaveBeenCalledTimes(1))
    view.setOpen(false)
    await act(() => {
      finish({ profile: { appConfig: saveRequest.mock.calls[0][0].data.appConfig } })
      return Promise.resolve()
    })
    view.setOpen(true)
    expect(screen.getByRole('status').textContent).toBe('All changes saved')
    expect(useAuthStore.getState().user?.appConfig?.appearance).toMatchObject({ preset: 'noir' })
    await act(() => Promise.resolve())
  })

  it('ignores the previous account’s save response after switching accounts', async () => {
    let finish!: (result: unknown) => void
    saveRequest.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Mono' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(saveRequest).toHaveBeenCalledTimes(1))
    act(() =>
      useAuthStore
        .getState()
        .setAuthenticated(account('b', { ...saved, preset: 'coldwave' }), 'token-b'),
    )
    await act(() => {
      finish({ profile: { appConfig: saveRequest.mock.calls[0][0].data.appConfig } })
      return Promise.resolve()
    })
    expect(useAuthStore.getState().user?.id).toBe('b')
    expect(appearance.settings.preset).toBe('coldwave')
    expect(screen.getByRole('status').textContent).toBe('All changes saved')
  })
})
