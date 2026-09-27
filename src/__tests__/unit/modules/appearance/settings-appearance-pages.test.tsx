import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { AppearanceContextValue, AppearanceSettings } from '@/shared/theme'
import { AppSettingsDialog } from '@/core/layouts/app-layout/ui/app-settings-dialog'
import { StudioSettingsDialog } from '@/core/layouts/studio-layout/studio-settings-dialog'
import { patchApiProfileMe } from '@/core/api/generated/profile/profile'
import { AuthBootstrap } from '@/modules/auth/components/auth-bootstrap'
import { useAuthStore } from '@/modules/auth/model'
import {
  AppThemeProvider,
  defaultAppearanceSettings,
  sanitizeAppearanceSettings,
  useAppearance,
} from '@/shared/theme'
import { Dialog } from '@/shared/ui'

const scene = vi.hoisted(() => ({ create: vi.fn(), dispose: vi.fn(), update: vi.fn() }))
vi.mock('@/components/app-backdrop/renderer', () => ({ createBackdropRenderer: scene.create }))
vi.mock('@/core/api/generated/profile/profile', () => ({
  patchApiProfileMe: vi.fn(),
  getGetApiProfileMeQueryKey: () => ['/api/profile/me'],
}))
vi.mock('@/modules/auth/hooks', () => ({ useAuthBootstrap: vi.fn() }))
vi.mock('@/core/layouts/app-layout/ui/settings', () => ({
  AccountSettingsSection: () => <p>Account details</p>,
  PinnedSettingsSection: () => <p>Pinned rooms</p>,
  HistorySettingsSection: () => <p>Recent rooms</p>,
}))
vi.mock('@/modules/settings/account-settings-section', () => ({
  AccountSettingsSection: () => <p>Account details</p>,
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const saved = sanitizeAppearanceSettings({
  ...defaultAppearanceSettings,
  mode: 'dark',
  preset: 'noir',
  surfaceStyle: 'glass',
  background: { ...defaultAppearanceSettings.background, preset: 'none' },
})
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

function setup({ studio = false, open = true } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Tree({ shown }: { shown: boolean }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AuthBootstrap>
            <Probe />
            <Dialog open={shown}>
              {studio ? <StudioSettingsDialog /> : <AppSettingsDialog />}
            </Dialog>
          </AuthBootstrap>
        </AppThemeProvider>
      </QueryClientProvider>
    )
  }
  const view = render(<Tree shown={open} />)
  return { ...view, setOpen: (shown: boolean) => view.rerender(<Tree shown={shown} />) }
}
const settle = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
const page = (name: string) =>
  fireEvent.keyDown(screen.getByRole('tab', { name }), { key: 'Enter' })
const option = (group: string, name: string) =>
  within(screen.getByRole('group', { name: group })).getByRole('button', { name })
const tickSave = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(600)
  })

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  vi.mocked(patchApiProfileMe).mockReset()
  vi.mocked(patchApiProfileMe).mockResolvedValue(
    {} as Awaited<ReturnType<typeof patchApiProfileMe>>,
  )
  scene.create.mockImplementation(() => ({ update: scene.update, dispose: scene.dispose }))
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
  })
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width: 768px'),
    media: query,
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
afterEach(async () => {
  act(() => useAuthStore.getState().reset())
  cleanup()
  await vi.advanceTimersByTimeAsync(0)
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('appearance settings pages', () => {
  it('keeps keyboard navigation within the appearance tabs and remembers the chosen tab', async () => {
    setup()
    const colors = screen.getByRole('tab', { name: 'Colors' })
    act(() => colors.focus())
    fireEvent.keyDown(colors, { key: 'ArrowRight' })
    await settle()
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Glass' }))
    expect(screen.getByRole('tab', { name: 'Appearance' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    page('Account')
    page('Appearance')
    expect(screen.getByRole('tab', { name: 'Glass' }).getAttribute('aria-selected')).toBe('true')
    await settle()
  })

  it('searches nested preferences from another section and focuses the matching control', async () => {
    setup()
    page('Account')
    const status = screen.getByRole('status', { name: 'Appearance sync' })
    const search = screen.getByRole('searchbox', { name: 'Search settings' })
    fireEvent.change(search, { target: { value: 'GLASS strong' } })
    const result = screen.getByRole('button', { name: 'Glass intensity Appearance / Glass' })
    expect(screen.queryByRole('group', { name: 'Glass intensity' })).toBeNull()
    expect(screen.getByRole('status', { name: 'Appearance sync' })).toBe(status)
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(result)
    fireEvent.click(result)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(32)
    })
    expect(screen.getByRole('tab', { name: 'Appearance' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Glass' }).getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(option('Glass intensity', 'Subtle'))
    expect((search as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('status', { name: 'Appearance sync' })).toBe(status)
    await tickSave()
    expect(patchApiProfileMe).not.toHaveBeenCalled()
  })

  it('finds palettes by current names and previous names without changing the selected palette', async () => {
    setup()
    const search = screen.getByRole('searchbox', { name: 'Search settings' })
    for (const query of ['Mono', 'Noir', 'OLED', 'Heatwave', 'Amber']) {
      fireEvent.change(search, { target: { value: query } })
      expect(
        screen.getByRole('button', { name: 'Color palette Appearance / Colors' }),
      ).toBeDefined()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Color palette Appearance / Colors' }))
    expect(option('Color palette', 'Mono').getAttribute('aria-pressed')).toBe('true')
    expect(
      within(screen.getByRole('group', { name: 'Color palette' }))
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Classic', 'Slate', 'Amber', 'Cyan', 'Violet', 'Mono', 'Pearl'])
    expect(appearance.settings.preset).toBe('noir')
    await settle()
  })

  it('finds White Glass without applying it, then saves the coordinated look in one account update', async () => {
    const previous = sanitizeAppearanceSettings({
      ...saved,
      mode: 'system',
      surfaceStyle: 'solid',
      glassMotion: 'off',
      glassIntensity: 'strong',
      logoStrategy: 'mono',
      background: { ...saved.background, preset: 'contours', brightness: 0.2 },
      customTheme: { enabled: true, overrides: { dark: { primary: '#8899AA' } } },
    })
    useAuthStore.getState().setAuthenticated(account('a', previous), 'token-a')
    setup()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search settings' }), {
      target: { value: 'White Glass' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'White Glass Appearance / Colors' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(32)
    })
    expect(appearance.settings).toEqual(previous)
    const apply = screen.getByRole<HTMLButtonElement>('button', { name: 'Apply White Glass' })
    expect(document.activeElement).toBe(apply)
    expect(patchApiProfileMe).not.toHaveBeenCalled()
    fireEvent.click(apply)
    expect(appearance.settings).toEqual({
      ...previous,
      mode: 'light',
      preset: 'pearl',
      surfaceStyle: 'glass',
      customTheme: { ...previous.customTheme, enabled: false },
    })
    expect(apply.disabled).toBe(true)
    expect(option('Color palette', 'Pearl').getAttribute('aria-pressed')).toBe('true')
    await tickSave()
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    expect(vi.mocked(patchApiProfileMe).mock.calls[0][0].appConfig).toEqual({
      appearance: appearance.settings,
      unrelated: { keep: true },
    })
  })

  it('selects Pearl as colors only without altering other appearance choices', async () => {
    setup()
    const previous = appearance.settings
    fireEvent.click(option('Color palette', 'Pearl'))
    expect(appearance.settings).toEqual({ ...previous, preset: 'pearl' })
    await tickSave()
    expect(vi.mocked(patchApiProfileMe).mock.calls[0][0].appConfig?.appearance).toEqual({
      ...previous,
      preset: 'pearl',
    })
  })

  it('clears empty search results on Escape before closing the dialog and restores the last tab', async () => {
    setup()
    page('Background')
    const search = screen.getByRole('searchbox', { name: 'Search settings' })
    fireEvent.change(search, { target: { value: 'missing-setting' } })
    expect(screen.getByText('No settings found.')).toBeDefined()
    expect(screen.queryByRole('tablist', { name: 'Appearance preferences' })).toBeNull()
    fireEvent.keyDown(search, { key: 'Escape' })
    expect((search as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('dialog')).toBeDefined()
    expect(document.activeElement).toBe(search)
    expect(screen.getByRole('tab', { name: 'Background' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    fireEvent.change(search, { target: { value: ' logout ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Account' }))
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true')
    await settle()
  })

  it.each([false, true])(
    'groups visual preferences under Appearance in the studio=%s layout',
    async (studio) => {
      setup({ studio })
      const labels = within(screen.getByRole('tablist', { name: 'Settings sections' }))
        .getAllByRole('tab')
        .map((tab) => tab.textContent)
      expect(labels[0]).toBe('Appearance')
      expect(labels).not.toContain('Glass')
      expect(
        within(screen.getByRole('tablist', { name: 'Appearance preferences' }))
          .getAllByRole('tab')
          .map((tab) => tab.textContent),
      ).toEqual(['Colors', 'Glass', 'Background'])
      expect(screen.getByRole('group', { name: 'Color palette' })).toBeDefined()
      expect(screen.queryByRole('group', { name: 'Glass motion' })).toBeNull()
      expect(screen.queryByRole('checkbox', { name: 'Use custom colors' })).toBeNull()
      const status = screen.getByRole('status', { name: 'Appearance sync' })
      page('Glass')
      expect(screen.getByRole('group', { name: 'Glass motion' })).toBeDefined()
      expect(screen.queryByRole('group', { name: 'Color palette' })).toBeNull()
      expect(screen.getByRole('status', { name: 'Appearance sync' })).toBe(status)

      expect(document.querySelectorAll('[data-fluid-glass-group]')).toHaveLength(4)
      for (const label of ['Surface style', 'Glass intensity', 'Glass motion']) {
        const track = screen.getByRole('group', { name: label })
        expect(track.closest('[data-fluid-glass-group]')).not.toBeNull()
        expect(track.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(1)
      }
      page('Background')
      expect(screen.getByRole('group', { name: 'Background preset' })).toBeDefined()
      expect(screen.queryByRole('group', { name: 'Glass motion' })).toBeNull()
      expect(screen.getByRole('status', { name: 'Appearance sync' })).toBe(status)
      await settle()
    },
  )

  it('coalesces changes across pages without flushing or creating another queue during navigation', async () => {
    setup()
    await settle()
    fireEvent.click(option('Color palette', 'Amber'))
    page('Glass')
    fireEvent.click(option('Glass intensity', 'Strong'))
    page('Background')
    fireEvent.click(option('Background preset', 'Silk'))
    fireEvent.change(screen.getByRole('slider', { name: 'Brightness' }), {
      target: { value: '23' },
    })
    await settle()
    expect(patchApiProfileMe).not.toHaveBeenCalled()
    await tickSave()
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    expect(vi.mocked(patchApiProfileMe).mock.calls[0][0]).toMatchObject({
      appConfig: {
        unrelated: { keep: true },
        appearance: {
          preset: 'heatwave',
          glassIntensity: 'strong',
          background: { preset: 'silk', brightness: 0.23 },
        },
      },
    })
    expect(screen.getByRole('status', { name: 'Appearance sync' }).textContent).toBe(
      'Appearance saved to your account',
    )
  })

  it('preserves custom colors across preset selection and temporarily disabling them', async () => {
    useAuthStore.getState().setAuthenticated(
      account('a', {
        ...saved,
        customTheme: { enabled: true, overrides: { dark: { background: '#080808' }, light: {} } },
      }),
      'token-a',
    )
    setup()
    const custom = screen.getByRole('checkbox', { name: 'Use custom colors' })
    fireEvent.click(option('Color palette', 'Cyan'))
    expect(appearance.settings.customTheme.overrides.dark?.background).toBe('#080808')
    fireEvent.click(custom)
    expect(appearance.settings.customTheme.enabled).toBe(false)
    expect(appearance.settings.customTheme.overrides.dark?.background).toBe('#080808')
    await settle()
  })

  it('lets Solid users configure a background and switch to Glass without changing stored motion', async () => {
    useAuthStore
      .getState()
      .setAuthenticated(account('a', { ...saved, surfaceStyle: 'solid' }), 'token-a')
    setup()
    page('Glass')
    expect(screen.queryByRole('group', { name: 'Glass intensity' })).toBeNull()
    page('Background')
    fireEvent.click(option('Background preset', 'Contours'))
    expect(appearance.settings.surfaceStyle).toBe('solid')
    fireEvent.click(screen.getByRole('button', { name: 'Use Glass' }))
    expect(appearance.settings.surfaceStyle).toBe('glass')
    expect(appearance.settings.glassMotion).toBe(saved.glassMotion)
    expect(appearance.settings.background.preset).toBe('contours')
    expect(screen.queryByRole('button', { name: 'Use Glass' })).toBeNull()
    await settle()
  })

  it('mounts one preview only for a chosen scene and disposes it when leaving Background', async () => {
    setup()
    page('Background')
    expect(screen.queryByRole('slider', { name: 'Brightness' })).toBeNull()
    expect(document.querySelector('canvas')).toBeNull()
    fireEvent.click(option('Background preset', 'Ribbons'))
    await settle()
    expect(scene.create).toHaveBeenCalledTimes(1)
    expect(document.querySelectorAll('canvas')).toHaveLength(1)
    expect(screen.queryByRole('slider', { name: 'Speed' })).toBeNull()
    fireEvent.click(option('Background motion', 'Animated'))
    expect(screen.getByRole('slider', { name: 'Speed' })).toBeDefined()
    page('Colors')
    await settle()
    expect(scene.dispose).toHaveBeenCalledTimes(1)
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('keeps error feedback and retry available after leaving the edited page', async () => {
    vi.mocked(patchApiProfileMe).mockRejectedValueOnce(new Error('offline'))
    setup()
    fireEvent.click(option('Color palette', 'Amber'))
    await tickSave()
    page('Account')
    expect(screen.getByRole('status', { name: 'Appearance sync' }).textContent).toContain(
      'Account sync failed',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await tickSave()
    expect(patchApiProfileMe).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status', { name: 'Appearance sync' }).textContent).toBe(
      'Appearance saved to your account',
    )
  })

  it('does not run Settings autosave while its dialog is closed', async () => {
    setup({ open: false })
    act(() => appearance.setPreset('heatwave'))
    await tickSave()
    expect(patchApiProfileMe).not.toHaveBeenCalled()
    expect(screen.queryByRole('status', { name: 'Appearance sync' })).toBeNull()
  })

  it('flushes the last change when closing from another page', async () => {
    const view = setup()
    fireEvent.click(option('Color palette', 'Amber'))
    page('Account')
    view.setOpen(false)
    await settle()
    expect(patchApiProfileMe).toHaveBeenCalledTimes(1)
    expect(vi.mocked(patchApiProfileMe).mock.calls[0][0].appConfig?.appearance).toMatchObject({
      preset: 'heatwave',
    })
  })
})
