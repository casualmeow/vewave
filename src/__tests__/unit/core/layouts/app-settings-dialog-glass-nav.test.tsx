import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppSettingsDialog } from '@/core/layouts/app-layout/ui/app-settings-dialog'
import { Dialog, DialogTrigger } from '@/shared/ui'

vi.mock('@/core/layouts/app-layout/ui/settings', () => ({
  AccountSettingsSection: () => <div data-testid="section-account" />,
  HistorySettingsSection: () => <div data-testid="section-history" />,
  PinnedSettingsSection: () => <div data-testid="section-pinned" />,
}))

vi.mock('@/modules/settings', () => ({
  appearanceSettingsSections: [
    {
      id: 'appearance',
      label: 'Appearance',
      description: 'Colors',
      icon: null,
      content: <div data-testid="section-appearance" />,
    },
  ],
  AppearanceSettingsFooter: () => <p role="status">Appearance saved</p>,
}))

type MediaPreferences = {
  reducedMotion?: boolean
  reducedTransparency?: boolean
  desktop?: boolean
}

function stubMatchMedia({
  reducedMotion = false,
  reducedTransparency = false,
  desktop = true,
}: MediaPreferences) {
  window.matchMedia = vi.fn((query: string) => {
    const matches = query.includes('prefers-reduced-motion')
      ? reducedMotion
      : query.includes('prefers-reduced-transparency')
        ? reducedTransparency
        : query.includes('min-width: 768px')
          ? desktop
          : false
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
  })
}

function renderSettings(preferences: MediaPreferences = {}) {
  stubMatchMedia(preferences)
  return render(
    <Dialog open>
      <AppSettingsDialog />
    </Dialog>,
  )
}

const navigation = () => screen.getByRole('tablist', { name: 'Settings sections' })
const navButton = (name: string) => within(navigation()).getByRole('tab', { name })
const glassGroup = () => navigation().closest('[data-fluid-glass-group]')!
const select = (name: string) => fireEvent.mouseDown(navButton(name), { button: 0, ctrlKey: false })
const attr = (element: Element, name: string) => element.getAttribute(name)

beforeEach(() => {
  document.documentElement.dataset.surfaceStyle = 'glass'
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

afterEach(() => {
  cleanup()
  delete document.documentElement.dataset.surfaceStyle
  vi.restoreAllMocks()
})

describe('settings navigation glass pilot', () => {
  it('closes on Escape and restores focus to the trigger', async () => {
    stubMatchMedia({})
    render(
      <Dialog>
        <DialogTrigger>Open settings</DialogTrigger>
        <AppSettingsDialog />
      </Dialog>,
    )
    const trigger = screen.getByRole('button', { name: 'Open settings' })
    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('exposes one dialog and one tab system with a linked panel', () => {
    renderSettings()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getAllByRole('tablist')).toHaveLength(1)
    expect(within(navigation()).getAllByRole('tab')).toHaveLength(4)
    expect(navButton('Appearance').getAttribute('aria-controls')).toBe(
      screen.getByRole('tabpanel').id,
    )
  })

  it('resolves to the CSS approximation over arbitrary live DOM', () => {
    renderSettings()

    const group = glassGroup()

    expect(attr(group, 'data-fluid-glass-resolved-backend')).toBe('css-glass')
    expect(attr(group, 'data-fluid-glass-source')).toBe('arbitrary-dom')
    expect(attr(group, 'data-fluid-glass-backend')).toBe('css')
    expect(navigation().querySelector('canvas')).toBeNull()
  })

  it('lets the selected navigation item drive the lens target', () => {
    renderSettings()

    const appearance = navButton('Appearance')
    expect(attr(appearance, 'aria-selected')).toBe('true')
    expect(attr(appearance.closest('[data-fluid-glass-target]')!, 'data-fluid-glass-target')).toBe(
      'settings-appearance',
    )
    expect(attr(appearance, 'data-active')).toBe('true')
    expect(navButton('Account').hasAttribute('data-active')).toBe(false)
  })

  it('moves selection and its accessible state on click', () => {
    renderSettings()

    select('Watch history')

    expect(attr(navButton('Watch history'), 'aria-selected')).toBe('true')
    expect(attr(navButton('Appearance'), 'aria-selected')).toBe('false')
    expect(navButton('Appearance').hasAttribute('data-active')).toBe(false)

    expect(screen.getByRole('heading', { name: 'Watch history' })).toBeDefined()
    expect(screen.getByTestId('section-history')).toBeDefined()
  })

  it('supports vertical arrow navigation and roving focus', async () => {
    renderSettings()

    expect(navigation().getAttribute('aria-orientation')).toBe('vertical')
    act(() => navButton('Appearance').focus())
    fireEvent.keyDown(navButton('Appearance'), { key: 'ArrowDown' })
    await waitFor(() => expect(document.activeElement).toBe(navButton('Pinned items')))
    expect(navButton('Pinned items').getAttribute('aria-selected')).toBe('true')
    expect(navButton('Pinned items').tabIndex).toBe(0)
    expect(navButton('Appearance').tabIndex).toBe(-1)
  })

  it('reveals the focused tab in the mobile horizontal rail', async () => {
    renderSettings({ desktop: false })
    expect(navigation().getAttribute('aria-orientation')).toBe('horizontal')
    const pinned = navButton('Pinned items')
    const scroll = vi.fn()
    pinned.scrollIntoView = scroll
    act(() => navButton('Appearance').focus())
    fireEvent.keyDown(navButton('Appearance'), { key: 'ArrowRight' })
    await waitFor(() => expect(document.activeElement).toBe(pinned))
    expect(scroll).toHaveBeenCalledWith({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'instant',
    })
  })

  it('never writes lens geometry onto the semantic target', () => {
    renderSettings()

    const account = navButton('Account')
    fireEvent.pointerDown(account, { pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(account, { pointerId: 1, clientX: 60, clientY: 40 })
    fireEvent.pointerUp(account, { pointerId: 1, clientX: 60, clientY: 40 })
    select('Account')

    for (const label of ['Appearance', 'Pinned items', 'Watch history', 'Account']) {
      const element = navButton(label)
      expect(element.style.transform).toBe('')
      expect(element.style.translate).toBe('')
    }

    expect(glassGroup().querySelector('[data-fluid-glass-fallback-lens]')).not.toBeNull()
  })

  it('subscribes to scroll and resize, and releases them on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')

    const view = renderSettings()

    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(add).toHaveBeenCalledWith('resize', expect.any(Function))

    fireEvent.scroll(window)
    fireEvent.resize(window)
    expect(attr(navButton('Appearance'), 'aria-selected')).toBe('true')

    view.unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true)
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('honours reduced motion without changing the backend', () => {
    renderSettings({ reducedMotion: true })

    expect(attr(glassGroup(), 'data-reduced-motion')).toBe('true')
    expect(attr(glassGroup(), 'data-glass-motion')).toBe('off')
    expect(attr(glassGroup(), 'data-fluid-glass-resolved-backend')).toBe('css-glass')
  })

  it('downgrades to a usable solid fallback under reduced transparency', () => {
    renderSettings({ reducedTransparency: true })

    const group = glassGroup()
    expect(attr(group, 'data-fluid-glass-resolved-backend')).toBe('solid')
    expect(attr(group, 'data-fluid-glass-accessibility-enforced')).toBe('true')
    expect(glassGroup().querySelector('[data-fluid-glass-fallback-lens="solid"]')).not.toBeNull()

    select('Pinned items')
    expect(attr(navButton('Pinned items'), 'aria-selected')).toBe('true')
    expect(screen.getByTestId('section-pinned')).toBeDefined()
  })
})
