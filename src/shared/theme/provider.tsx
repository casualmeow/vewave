import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  appearanceModeStorageKey,
  loadAppearanceSettings,
  saveAppearanceSettings,
} from './persistence'
import { defaultAppearanceSettings, getThemePreset } from './presets'
import { applyThemeTokens, clearThemeTokens, resolveThemeTokens } from './resolver'
import {
  type AppearanceMode,
  type AppearancePresetId,
  type AppearanceSettings,
  type EditableThemeTokenName,
  type GlassIntensity,
  type LogoStrategy,
  type ResolvedAppearanceMode,
} from './contract'

type AppearanceContextValue = {
  mode: AppearanceMode
  resolvedMode: ResolvedAppearanceMode
  settings: AppearanceSettings
  tokens: ReturnType<typeof resolveThemeTokens>
  resetAppearance: () => void
  setCustomThemeEnabled: (enabled: boolean) => void
  setCustomToken: (
    mode: ResolvedAppearanceMode,
    token: EditableThemeTokenName,
    value: string,
  ) => void
  setGlassIntensity: (glassIntensity: GlassIntensity) => void
  setLogoStrategy: (logoStrategy: LogoStrategy) => void
  setMode: (mode: AppearanceMode) => void
  setPreset: (preset: AppearancePresetId) => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey={appearanceModeStorageKey}
      themes={['light', 'dark']}
      value={{ dark: 'dark', light: 'light' }}
    >
      <AppearanceStateProvider>{children}</AppearanceStateProvider>
    </NextThemeProvider>
  )
}

function AppearanceStateProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const [settings, setSettings] = useState<AppearanceSettings>(() => loadAppearanceSettings())
  const resolvedMode: ResolvedAppearanceMode = resolvedTheme === 'dark' ? 'dark' : 'light'
  const mode: AppearanceMode =
    theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system'
  const tokens = useMemo(() => resolveThemeTokens(settings, resolvedMode), [resolvedMode, settings])

  useEffect(() => {
    saveAppearanceSettings(settings)
  }, [settings])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.preset = settings.preset
    root.dataset.glassIntensity = settings.glassIntensity
    root.dataset.logoStrategy = settings.logoStrategy
    applyThemeTokens(tokens, root)

    return () => {
      clearThemeTokens(root)
      delete root.dataset.preset
      delete root.dataset.glassIntensity
      delete root.dataset.logoStrategy
    }
  }, [settings.glassIntensity, settings.logoStrategy, settings.preset, tokens])

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
        setTheme('system')
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
        updateSettings((current) => ({
          ...current,
          customTheme: {
            ...current.customTheme,
            enabled: true,
            overrides: {
              ...current.customTheme.overrides,
              [targetMode]: {
                ...(current.customTheme.overrides[targetMode] ?? {}),
                [token]: tokenValue,
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
      setMode: (nextMode) => {
        setTheme(nextMode)
      },
      setPreset: (preset) => {
        updateSettings((current) => ({ ...current, preset }))
      },
    }),
    [mode, resolvedMode, setTheme, settings, tokens, updateSettings],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const context = useContext(AppearanceContext)

  if (!context) {
    throw new Error('useAppearance must be used within AppThemeProvider.')
  }

  return context
}

export function useAppearancePreset() {
  const { settings } = useAppearance()
  return getThemePreset(settings.preset)
}
