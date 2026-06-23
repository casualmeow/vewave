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

describe('AppThemeProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createStorageMock(),
    })
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
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
})
