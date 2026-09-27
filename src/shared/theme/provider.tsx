import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  loadAppearanceSettings,
  sanitizeAppearanceSettings,
  sanitizeBackgroundSettings,
  saveAppearanceSettings,
} from './persistence'
import { getVewaveLogoFaviconHref } from './logo'
import { defaultAppearanceSettings } from './presets'
import { applyThemeTokens, clearThemeTokens, resolveThemeTokens } from './resolver'
import {
  type AppearanceMode,
  type AppearanceSettings,
  type ResolvedAppearanceMode,
} from './contract'
import { normalizeHexColor } from './validators'
import { AppearanceContext, type AppearanceContextValue } from './context'
import { glassMotionProfiles } from './glass-motion'

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return <AppearanceStateProvider>{children}</AppearanceStateProvider>
}

function AppearanceStateProvider({ children }: { children: ReactNode }) {
  const [{ accountId, settings }, setScope] = useState(() => ({
    accountId: null as string | null,
    settings: loadAppearanceSettings(),
  }))
  const setSettings = useCallback(
    (next: AppearanceSettings | ((current: AppearanceSettings) => AppearanceSettings)) => {
      setScope((current) => ({
        ...current,
        settings: typeof next === 'function' ? next(current.settings) : next,
      }))
    },
    [],
  )
  const bindAppearanceAccount = useCallback(
    (owner: string | null, saved?: AppearanceSettings | null) => {
      setScope((current) =>
        current.accountId === owner
          ? current
          : {
              accountId: owner,
              settings: saved ? sanitizeAppearanceSettings(saved) : loadAppearanceSettings(owner),
            },
      )
    },
    [],
  )
  const [systemMode, setSystemMode] = useState<ResolvedAppearanceMode>(() => getSystemMode())
  const mode: AppearanceMode = settings.mode
  const resolvedMode: ResolvedAppearanceMode = mode === 'system' ? systemMode : mode
  const tokens = useMemo(() => resolveThemeTokens(settings, resolvedMode), [resolvedMode, settings])

  useEffect(() => {
    saveAppearanceSettings(settings, accountId)
  }, [settings, accountId])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.inputModality = 'pointer'
    const keyboard = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) root.dataset.inputModality = 'keyboard'
    }
    const pointer = () => {
      root.dataset.inputModality = 'pointer'
    }
    document.addEventListener('keydown', keyboard, true)
    document.addEventListener('pointerdown', pointer, true)
    return () => {
      document.removeEventListener('keydown', keyboard, true)
      document.removeEventListener('pointerdown', pointer, true)
      delete root.dataset.inputModality
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemModeChange = () => {
      setSystemMode(media.matches ? 'dark' : 'light')
    }

    handleSystemModeChange()
    media.addEventListener('change', handleSystemModeChange)

    return () => media.removeEventListener('change', handleSystemModeChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedMode === 'dark')
    root.style.colorScheme = resolvedMode
    root.dataset.appearanceMode = mode
    root.dataset.resolvedMode = resolvedMode
    root.dataset.preset = settings.preset
    root.dataset.glassIntensity = settings.glassIntensity
    root.dataset.glassMotion = settings.glassMotion
    root.style.setProperty(
      '--glass-selection-duration',
      `${glassMotionProfiles[settings.glassMotion].travelMs}ms`,
    )
    root.dataset.logoStrategy = settings.logoStrategy
    root.dataset.surfaceStyle = settings.surfaceStyle
    root.dataset.glassRefraction = settings.surfaceStyle === 'glass' ? 'on' : 'off'
    applyThemeTokens(tokens, root)

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens.background)
    updateDocumentThemeIcons(
      getVewaveLogoFaviconHref({
        logoStrategy: settings.logoStrategy,
        resolvedMode,
        tokens,
      }),
    )

    return () => {
      clearThemeTokens(root)
      delete root.dataset.appearanceMode
      delete root.dataset.resolvedMode
      delete root.dataset.preset
      delete root.dataset.glassIntensity
      delete root.dataset.glassMotion
      root.style.removeProperty('--glass-selection-duration')
      delete root.dataset.logoStrategy
      delete root.dataset.surfaceStyle
      delete root.dataset.glassRefraction
      root.style.removeProperty('color-scheme')
    }
  }, [
    mode,
    resolvedMode,
    settings.experimentalRefraction,
    settings.glassIntensity,
    settings.glassMotion,
    settings.logoStrategy,
    settings.preset,
    settings.surfaceStyle,
    tokens,
  ])

  const updateSettings = useCallback(
    (updater: (current: AppearanceSettings) => AppearanceSettings) => {
      setSettings((current) => updater(current))
    },
    [setSettings],
  )

  const value = useMemo<AppearanceContextValue>(
    () => ({
      accountId,
      bindAppearanceAccount,
      mode,
      resolvedMode,
      settings,
      tokens,
      resetAppearance: () => {
        setSettings(defaultAppearanceSettings)
      },
      resetCustomMode: (targetMode) => {
        updateSettings((current) => ({
          ...current,
          customTheme: {
            ...current.customTheme,
            overrides: {
              ...current.customTheme.overrides,
              [targetMode]: {},
            },
          },
        }))
      },
      resetCustomTheme: () => {
        updateSettings((current) => ({
          ...current,
          customTheme: {
            enabled: false,
            overrides: {
              light: {},
              dark: {},
            },
          },
        }))
      },
      resetCustomToken: (targetMode, token) => {
        updateSettings((current) => {
          const nextModeOverrides = { ...(current.customTheme.overrides[targetMode] ?? {}) }
          delete nextModeOverrides[token]

          return {
            ...current,
            customTheme: {
              ...current.customTheme,
              overrides: {
                ...current.customTheme.overrides,
                [targetMode]: nextModeOverrides,
              },
            },
          }
        })
      },
      setCustomThemeEnabled: (enabled) => {
        updateSettings((current) => ({
          ...current,
          customTheme: {
            ...current.customTheme,
            enabled,
          },
        }))
      },
      setCustomToken: (targetMode, token, tokenValue) => {
        const normalizedTokenValue = normalizeHexColor(tokenValue)

        if (!normalizedTokenValue) {
          return
        }

        updateSettings((current) => ({
          ...current,
          customTheme: {
            ...current.customTheme,
            enabled: true,
            overrides: {
              ...current.customTheme.overrides,
              [targetMode]: {
                ...(current.customTheme.overrides[targetMode] ?? {}),
                [token]: normalizedTokenValue,
              },
            },
          },
        }))
      },
      setGlassIntensity: (glassIntensity) => {
        updateSettings((current) => ({ ...current, glassIntensity }))
      },
      setGlassMotion: (glassMotion) => {
        updateSettings((current) => ({ ...current, glassMotion }))
      },
      setBackground: (background) => {
        updateSettings((current) => ({
          ...current,
          background: sanitizeBackgroundSettings({ ...current.background, ...background }),
        }))
      },
      setLogoStrategy: (logoStrategy) => {
        updateSettings((current) => ({ ...current, logoStrategy }))
      },
      setAppearanceSettings: (nextSettings) => {
        setSettings(sanitizeAppearanceSettings(nextSettings))
      },
      setMode: (nextMode) => {
        updateSettings((current) => ({ ...current, mode: nextMode }))
      },
      setPreset: (preset) => {
        updateSettings((current) => ({ ...current, preset }))
      },
      setSurfaceStyle: (surfaceStyle) => {
        updateSettings((current) => ({ ...current, surfaceStyle }))
      },
      setExperimentalRefraction: (enabled) => {
        updateSettings((current) => ({ ...current, experimentalRefraction: enabled }))
      },
    }),
    [
      accountId,
      bindAppearanceAccount,
      mode,
      resolvedMode,
      settings,
      tokens,
      updateSettings,
      setSettings,
    ],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

function getSystemMode(): ResolvedAppearanceMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function updateDocumentThemeIcons(faviconHref: string) {
  const favicon = ensureDocumentIconLink('icon')
  favicon.setAttribute('href', faviconHref)
  favicon.setAttribute('type', 'image/svg+xml')

  const appleTouchIcon = ensureDocumentIconLink('apple-touch-icon')
  appleTouchIcon.setAttribute('href', faviconHref)
}

function ensureDocumentIconLink(rel: 'apple-touch-icon' | 'icon') {
  const existingLink = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (existingLink) {
    return existingLink
  }

  const link = document.createElement('link')
  link.setAttribute('rel', rel)
  document.head.append(link)

  return link
}
