import { useContext } from 'react'

import { AppearanceContext } from './context'
import { getThemePreset } from './presets'

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
