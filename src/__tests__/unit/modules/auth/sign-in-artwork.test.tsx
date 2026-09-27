import { useRef } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Theme from '@/shared/theme'
import type { AuthSceneOptions } from '@/modules/auth/rendering/auth-scene-renderer'
import { SignInArtwork, SignInBrand } from '@/modules/auth/components/sign-in-artwork'
import { SignInPage } from '@/modules/auth/components/sign-in-page'
import { SignUpPage } from '@/modules/auth/components/sign-up-page'
import { defaultAppearanceSettings, resolveThemeTokens } from '@/shared/theme'

const { create, destroy, setOptions, setPointer, setInteraction, setGeometry, preference } =
  vi.hoisted(() => ({
    create: vi.fn(),
    destroy: vi.fn(),
    setOptions: vi.fn(),
    setPointer: vi.fn(),
    setInteraction: vi.fn(),
    setGeometry: vi.fn(),
    preference: {
      reducedTransparency: false,
      forceFallback: false,
      reducedMotion: false,
      keyboard: false,
    },
  }))
let settings = { ...defaultAppearanceSettings }
let mode: 'light' | 'dark' = 'dark'
vi.mock('@/shared/theme', async (original) => ({
  ...(await original<typeof Theme>()),
  useAppearance: () => ({
    settings,
    resolvedMode: mode,
    tokens: resolveThemeTokens(settings, mode),
  }),
}))
vi.mock('@/shared/hooks/use-glass-appearance', () => ({ useGlassAppearance: () => preference }))
vi.mock('@/modules/auth/rendering/auth-scene-renderer', () => ({ createAuthSceneRenderer: create }))
vi.mock('@/modules/auth/components/login-form', () => ({
  LoginForm: () => <form aria-labelledby="sign-in-title" />,
}))
vi.mock('@/modules/auth/components/registration-form', () => ({
  RegistrationForm: () => <form aria-labelledby="sign-up-title" />,
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

let desktop = true
let resize: (() => void) | undefined
let geometryChanged: (() => void) | undefined
let callbacks: AuthSceneOptions
let plateHeight = 700
const disconnect = vi.fn()

function Harness() {
  const plateRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  return (
    <SignInArtwork plateRef={plateRef} formRef={formRef}>
      <div ref={plateRef} className="sign-in-plate">
        <SignInBrand />
        <div ref={formRef} className="sign-in-form-column">
          Form
        </div>
      </div>
    </SignInArtwork>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  desktop = true
  resize = undefined
  geometryChanged = undefined
  plateHeight = 700
  mode = 'dark'
  settings = { ...defaultAppearanceSettings }
  Object.assign(preference, {
    reducedTransparency: false,
    forceFallback: false,
    reducedMotion: false,
    keyboard: false,
  })
  create.mockImplementation((_canvas: HTMLCanvasElement, options: AuthSceneOptions) => {
    callbacks = options
    return { destroy, setOptions, setPointer, setInteraction, setGeometry }
  })
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return desktop
    },
    addEventListener: (_name: string, listener: () => void) => {
      resize = listener
    },
    removeEventListener: () => {
      resize = undefined
    },
  }))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        geometryChanged = callback
      }
      observe() {}
      disconnect = disconnect
    },
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const canvas = this.tagName === 'CANVAS'
    const form = this.className === 'sign-in-form-column'
    const x = canvas ? 0 : form ? 800 : 100
    const y = canvas ? 0 : 150
    const width = canvas ? 1600 : form ? 500 : 1200
    const height = canvas ? 1000 : plateHeight
    return {
      x,
      y,
      left: x,
      top: y,
      width,
      height,
      right: x + width,
      bottom: y + height,
      toJSON: () => ({}),
    }
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Sign-in artwork lifecycle', () => {
  it('keeps the original SVG visible independently of canvas readiness and disposes on unmount', async () => {
    const { container, unmount } = render(<Harness />)
    const logo = screen.getByRole('img', { name: 'Vewave' })
    expect(logo.getAttribute('src')).toContain('data:image/svg+xml,')
    expect(container.querySelector('[data-scene-ready]')).toBeNull()
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    expect(callbacks.surfaceStyle).toBe('solid')
    act(() => callbacks.onReady?.())
    expect(container.querySelector('[data-scene-ready]')).not.toBeNull()
    expect(screen.getByRole('img', { name: 'Vewave' })).toBe(logo)
    expect(logo.closest('[aria-hidden="true"]')).toBeNull()
    unmount()
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(resize).toBeUndefined()
  })

  it('measures the actual plate and updates optics after content grows', async () => {
    render(<Harness />)
    await waitFor(() => expect(setGeometry).toHaveBeenCalledTimes(1))
    expect(setGeometry).toHaveBeenLastCalledWith({
      width: 1600,
      height: 1000,
      plate: { x: 100, y: 150, width: 1200, height: 700, radius: 32 },
      formStartX: 800,
    })
    plateHeight = 820
    act(() => geometryChanged?.())
    expect(setGeometry).toHaveBeenLastCalledWith(
      expect.objectContaining({
        plate: expect.objectContaining({ height: 820 }),
      }),
    )
    expect(create).toHaveBeenCalledTimes(1)
  })

  it.each(['mobile', 'reduced transparency', 'forced fallback'])(
    'keeps the native logo and avoids WebGL for %s',
    async (reason) => {
      desktop = reason !== 'mobile'
      preference.reducedTransparency = reason === 'reduced transparency'
      preference.forceFallback = reason === 'forced fallback'
      await act(async () => {
        render(<Harness />)
        await Promise.resolve()
      })
      expect(create).not.toHaveBeenCalled()
      expect(screen.getByRole('img', { name: 'Vewave' })).toBeDefined()
    },
  )

  it('releases on mobile, recreates on desktop, and ignores callbacks from the previous instance', async () => {
    const { container } = render(<Harness />)
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    const previous = callbacks
    await act(async () => {
      desktop = false
      resize?.()
      await Promise.resolve()
    })
    expect(destroy).toHaveBeenCalledTimes(1)
    await act(async () => {
      desktop = true
      resize?.()
      await Promise.resolve()
    })
    expect(create).toHaveBeenCalledTimes(2)
    act(() => previous.onReady?.())
    expect(container.querySelector('[data-scene-ready]')).toBeNull()
    act(() => callbacks.onReady?.())
    expect(container.querySelector('[data-scene-ready]')).not.toBeNull()
  })

  it('restores the opaque fallback after context loss while retaining the logo', async () => {
    const { container } = render(<Harness />)
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    const logo = screen.getByRole('img', { name: 'Vewave' })
    act(() => callbacks.onReady?.())
    act(() => callbacks.onError?.())
    expect(container.querySelector('[data-scene-ready]')).toBeNull()
    expect(screen.getByRole('img', { name: 'Vewave' })).toBe(logo)
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('keeps fallback material when WebGL is unavailable', async () => {
    create.mockReturnValueOnce(null)
    const { container } = render(<Harness />)
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[data-scene-ready]')).toBeNull()
  })

  it('updates theme and material without rebuilding and respects motion constraints', async () => {
    const view = render(<Harness />)
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    settings = { ...settings, surfaceStyle: 'glass', preset: 'noir' }
    view.rerender(<Harness />)
    expect(setOptions).toHaveBeenLastCalledWith(
      expect.objectContaining({ surfaceStyle: 'glass', motion: 'fluid' }),
    )
    const src = screen.getByRole('img', { name: 'Vewave' }).getAttribute('src')!
    const svg = new DOMParser().parseFromString(
      decodeURIComponent(src.split(',')[1]),
      'image/svg+xml',
    )
    expect([...svg.querySelectorAll('path')].map((path) => path.getAttribute('fill'))).toEqual([
      resolveThemeTokens(settings, mode).logoLight,
      resolveThemeTokens(settings, mode).logoAccent,
    ])
    for (const constraint of ['off', 'keyboard', 'reducedMotion']) {
      settings = { ...settings, glassMotion: constraint === 'off' ? 'off' : 'fluid' }
      preference.keyboard = constraint === 'keyboard'
      preference.reducedMotion = constraint === 'reducedMotion'
      view.rerender(<Harness />)
      expect(setOptions).toHaveBeenLastCalledWith(expect.objectContaining({ motion: 'off' }))
    }
    mode = 'light'
    view.rerender(<Harness />)
    expect(setOptions).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: 'light',
        palette: expect.objectContaining({
          background: resolveThemeTokens(settings, mode).background,
        }),
      }),
    )
    expect(create).toHaveBeenCalledTimes(1)
  })

  it.each([
    { Page: SignInPage, heading: 'Sign in to Vewave', link: 'Create an account', to: '/sign-up' },
    { Page: SignUpPage, heading: 'Create your account', link: 'Sign in', to: '/sign-in' },
  ])(
    'composes $heading with shared home navigation, material and brand',
    async ({ Page, heading, link, to }) => {
      const { container } = render(<Page />)
      await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
      expect(screen.getByRole('link', { name: /Back to home/ }).getAttribute('href')).toBe('/')
      expect(screen.getByRole('link', { name: link }).getAttribute('href')).toBe(to)
      expect(screen.getByRole('form', { name: heading })).toBeDefined()
      expect(screen.getByRole('main', { name: heading })).toBeDefined()
      expect(screen.getAllByRole('img', { name: 'Vewave' })).toHaveLength(1)
      expect(container.querySelectorAll('.sign-in-plate')).toHaveLength(1)
      expect(container.querySelector('[data-slot="glass-surface"]')).toBeNull()
      expect(screen.queryByRole('button', { name: /appearance/i })).toBeNull()
    },
  )
})
