import { Palette } from 'lucide-react'
import { AppearanceSettingsSection } from './appearance-settings-section'
import { BackgroundSettingsSection } from './background-settings-section'
import { GlassSettingsSection } from './glass-settings-section'
import type { SettingsDialogSection } from '@/components/settings-dialog'
import { themePresets } from '@/shared/theme'

export const appearanceSettingsSections: ReadonlyArray<SettingsDialogSection> = [
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Make this workspace feel like yours.',
    icon: <Palette />,
    tabs: [
      {
        id: 'colors',
        label: 'Colors',
        content: <AppearanceSettingsSection />,
        searchItems: [
          {
            label: 'Display mode',
            target: 'mode',
            keywords: 'light dark system device interface theme',
          },
          {
            label: 'Color palette',
            target: 'palette',
            keywords: `theme preset ${themePresets.map((preset) => `${preset.label} ${preset.id}`).join(' ')} rosewave oled black white`,
          },
          {
            label: 'Custom colors',
            target: 'custom',
            keywords: 'theme color studio editor preview overrides',
          },
        ],
      },
      {
        id: 'glass',
        label: 'Glass',
        content: <GlassSettingsSection />,
        searchItems: [
          {
            label: 'White Glass',
            target: 'white-glass',
            keywords: 'pearl white light glass look clear fluid',
          },
          {
            label: 'Surface style',
            target: 'surface',
            keywords: 'solid glass transparency material',
          },
          {
            label: 'Glass intensity',
            target: 'intensity',
            keywords: 'blur frosting subtle balanced strong',
          },
          {
            label: 'Glass motion',
            target: 'glass-motion',
            keywords: 'animation fluid liquid subtle off reduced',
          },
        ],
      },
      {
        id: 'background',
        label: 'Background',
        content: <BackgroundSettingsSection />,
        searchItems: [
          {
            label: 'Background scene',
            target: 'scene',
            keywords: 'none ribbons silk contours shader wallpaper',
          },
          {
            label: 'Background colors',
            target: 'background-palette',
            keywords: 'palette theme custom',
          },
          { label: 'Brightness', target: 'brightness', keywords: 'dim intensity light' },
          {
            label: 'Background motion',
            target: 'background-motion',
            keywords: 'animation animated still speed reduced',
          },
        ],
      },
    ],
  },
]
