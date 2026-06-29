import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppearance } from './hooks'
import { AppThemeProvider } from './provider'
import { appearanceStorageKey } from './persistence'

function createStorageMock(): Storage {
  let entries: Record<string, string> = {}

  return {
    get length() {
      return Object.keys(entries).length
    },
    clear: vi.fn(() => {
      entries = {}
    }),
    getItem: vi.fn((key: string) => entries[key] ?? null),
    key: vi.fn((index: number) => Object.keys(entries)[index] ?? null),
    removeItem: vi.fn((key: string) => {
      delete entries[key]
    }),
    setItem: vi.fn((key: string, value: string) => {
      entries[key] = value
    }),
  }
}

function ThemeModeHarness() {
  const { mode, resolvedMode, setMode } = useAppearance()

  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="resolved-mode">{resolvedMode}</div>
      <button type="button" onClick={() => setMode('dark')}>
        Dark
      </button>
      <button type="button" onClick={() => setMode('light')}>
        Light
      </button>
    </div>
  )
}

function removeThemeHeadElements() {
  document.head
    .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], meta[name="theme-color"]')
    .forEach((element) => element.remove())
}

function getIconLink(rel: 'apple-touch-icon' | 'icon') {
  const link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  expect(link).not.toBeNull()

  return link as HTMLLinkElement
}

function decodeIconSvg(rel: 'apple-touch-icon' | 'icon') {
  const href = getIconLink(rel).getAttribute('href') ?? ''
  const prefix = 'data:image/svg+xml,'
  expect(href.startsWith(prefix)).toBe(true)

  return decodeURIComponent(href.slice(prefix.length))
}

describe('AppThemeProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorageMock(),
    })
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
    removeThemeHeadElements()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
    removeThemeHeadElements()
  })

  it('switches light and dark mode on the current page without reload', async () => {
    render(
      <AppThemeProvider>
        <ThemeModeHarness />
      </AppThemeProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))

    await waitFor(() => {
      expect(screen.getByTestId('mode').textContent).toBe('dark')
      expect(screen.getByTestId('resolved-mode').textContent).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#6B87AB')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Light' }))

    await waitFor(() => {
      expect(screen.getByTestId('mode').textContent).toBe('light')
      expect(screen.getByTestId('resolved-mode').textContent).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#D2274B')
    })

    expect(JSON.parse(window.localStorage.getItem(appearanceStorageKey) ?? '{}').mode).toBe('light')
  })

  it('updates favicon links from the actual resolved appearance', async () => {
    render(
      <AppThemeProvider>
        <ThemeModeHarness />
      </AppThemeProvider>,
    )

    await waitFor(() => {
      expect(decodeIconSvg('icon')).toContain('fill="#D2274B"')
    })

    const initialHref = getIconLink('icon').getAttribute('href')
    expect(getIconLink('icon').getAttribute('type')).toBe('image/svg+xml')
    expect(getIconLink('apple-touch-icon').getAttribute('href')).toBe(initialHref)

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))

    await waitFor(() => {
      expect(screen.getByTestId('resolved-mode').textContent).toBe('dark')
      expect(decodeIconSvg('icon')).toContain('fill="#CBD7E8"')
      expect(getIconLink('icon').getAttribute('href')).not.toBe(initialHref)
      expect(getIconLink('apple-touch-icon').getAttribute('href')).toBe(
        getIconLink('icon').getAttribute('href'),
      )
    })
  })

  it('uses persisted custom brand colors for logo variables and favicon links', async () => {
    window.localStorage.setItem(
      appearanceStorageKey,
      JSON.stringify({
        version: 1,
        mode: 'light',
        preset: 'default',
        logoStrategy: 'auto',
        glassIntensity: 'balanced',
        customTheme: {
          enabled: true,
          overrides: {
            light: { primary: '#0F9F6E', accent: '#F59E0B' },
            dark: {},
          },
        },
      }),
    )

    render(
      <AppThemeProvider>
        <ThemeModeHarness />
      </AppThemeProvider>,
    )

    await waitFor(() => {
      const iconSvg = decodeIconSvg('icon')

      expect(screen.getByTestId('resolved-mode').textContent).toBe('light')
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#0F9F6E')
      expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#F59E0B')
      expect(document.documentElement.style.getPropertyValue('--logo-dark')).toBe('#0F9F6E')
      expect(document.documentElement.style.getPropertyValue('--logo-light')).toBe('#0F9F6E')
      expect(document.documentElement.style.getPropertyValue('--logo-accent')).toBe('#F59E0B')
      expect(iconSvg).toContain('fill="#0F9F6E"')
      expect(iconSvg).toContain('fill="#F59E0B"')
      expect(getIconLink('apple-touch-icon').getAttribute('href')).toBe(
        getIconLink('icon').getAttribute('href'),
      )
    })
  })
})
