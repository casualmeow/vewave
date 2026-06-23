import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  loadAppearanceSettings,
  sanitizeAppearanceSettings,
  saveAppearanceSettings,
} from './persistence'
import { defaultAppearanceSettings } from './presets'
import { applyThemeTokens, clearThemeTokens, resolveThemeTokens } from './resolver'
import {
  type AppearanceMode,
  type AppearanceSettings,
  type ResolvedAppearanceMode,
} from './contract'
import { normalizeHexColor } from './validators'
import { AppearanceContext, type AppearanceContextValue } from './context'

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return <AppearanceStateProvider>{children}</AppearanceStateProvider>
}

function AppearanceStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(() => loadAppearanceSettings())
  const [systemMode, setSystemMode] = useState<ResolvedAppearanceMode>(() => getSystemMode())
  const mode: AppearanceMode = settings.mode
  const resolvedMode: ResolvedAppearanceMode = mode === 'system' ? systemMode : mode
  const tokens = useMemo(() => resolveThemeTokens(settings, resolvedMode), [resolvedMode, settings])

  useEffect(() => {
    saveAppearanceSettings(settings)
  }, [settings])

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
    root.dataset.logoStrategy = settings.logoStrategy
    applyThemeTokens(tokens, root)

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens.background)

    return () => {
      clearThemeTokens(root)
      delete root.dataset.appearanceMode
      delete root.dataset.resolvedMode
      delete root.dataset.preset
      delete root.dataset.glassIntensity
      delete root.dataset.logoStrategy
      root.style.removeProperty('color-scheme')
    }
  }, [mode, resolvedMode, settings.glassIntensity, settings.logoStrategy, settings.preset, tokens])

  const updateSettings = useCallback(
    (updater: (current: AppearanceSettings) => AppearanceSettings) => {
      setSettings((current) => updater(current))
    },
    [],
  )

  const value = useMemo<AppearanceContextValue>(
    () => ({
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
    }),
    [mode, resolvedMode, settings, tokens, updateSettings],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

function getSystemMode(): ResolvedAppearanceMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
