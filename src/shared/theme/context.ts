import { createContext } from 'react'

import type {
  AppearanceMode,
  AppearancePresetId,
  AppearanceSettings,
  EditableThemeTokenName,
  GlassIntensity,
  LogoStrategy,
  ResolvedAppearanceMode,
} from './contract'
import type { resolveThemeTokens } from './resolver'

export type AppearanceContextValue = {
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
  setLogoStrategy: (logoStrategy: LogoStrategy) => void
  setMode: (mode: AppearanceMode) => void
  setPreset: (preset: AppearancePresetId) => void
  settings: AppearanceSettings
  tokens: ReturnType<typeof resolveThemeTokens>
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null)
