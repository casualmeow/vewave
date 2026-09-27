import { createContext } from 'react'

import type {
  AppearanceMode,
  AppearancePresetId,
  AppearanceSettings,
  BackgroundSettings,
  EditableThemeTokenName,
  GlassIntensity,
  GlassMotion,
  LogoStrategy,
  ResolvedAppearanceMode,
  SurfaceStyle,
} from './contract'
import type { resolveThemeTokens } from './resolver'

export type AppearanceContextValue = {
  accountId: string | null
  bindAppearanceAccount: (accountId: string | null, saved?: AppearanceSettings | null) => void
  mode: AppearanceMode
  resolvedMode: ResolvedAppearanceMode
  resetAppearance: () => void
  resetCustomMode: (mode: ResolvedAppearanceMode) => void
  resetCustomTheme: () => void
  resetCustomToken: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName) => void
  setAppearanceSettings: (settings: AppearanceSettings) => void
  setCustomThemeEnabled: (enabled: boolean) => void
  setCustomToken: (
    mode: ResolvedAppearanceMode,
    token: EditableThemeTokenName,
    value: string,
  ) => void
  setGlassIntensity: (glassIntensity: GlassIntensity) => void
  setGlassMotion: (glassMotion: GlassMotion) => void
  setBackground: (background: Partial<BackgroundSettings>) => void
  setLogoStrategy: (logoStrategy: LogoStrategy) => void
  setExperimentalRefraction: (enabled: boolean) => void
  setMode: (mode: AppearanceMode) => void
  setPreset: (preset: AppearancePresetId) => void
  setSurfaceStyle: (surfaceStyle: SurfaceStyle) => void
  settings: AppearanceSettings
  tokens: ReturnType<typeof resolveThemeTokens>
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null)
