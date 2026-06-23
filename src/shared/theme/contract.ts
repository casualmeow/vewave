export const appearanceModes = ['light', 'dark', 'system'] as const
export const resolvedAppearanceModes = ['light', 'dark'] as const
export const appearancePresetIds = ['default', 'vewave'] as const
export const logoStrategies = ['auto', 'light', 'dark', 'mono'] as const
export const glassIntensities = ['subtle', 'balanced', 'strong'] as const
export const appearanceConfigVersion = 1

export type AppearanceMode = (typeof appearanceModes)[number]
export type ResolvedAppearanceMode = (typeof resolvedAppearanceModes)[number]
export type AppearancePresetId = (typeof appearancePresetIds)[number]
export type LogoStrategy = (typeof logoStrategies)[number]
export type GlassIntensity = (typeof glassIntensities)[number]

export type ThemeTokenName =
  | 'radius'
  | 'background'
  | 'foreground'
  | 'card'
  | 'cardForeground'
  | 'popover'
  | 'popoverForeground'
  | 'primary'
  | 'primaryForeground'
  | 'secondary'
  | 'secondaryForeground'
  | 'muted'
  | 'mutedForeground'
  | 'accent'
  | 'accentForeground'
  | 'destructive'
  | 'destructiveForeground'
  | 'success'
  | 'successForeground'
  | 'warning'
  | 'warningForeground'
  | 'mediaBackground'
  | 'mediaForeground'
  | 'mediaMuted'
  | 'mediaControl'
  | 'border'
  | 'input'
  | 'ring'
  | 'surfaceElevated'
  | 'chart1'
  | 'chart2'
  | 'chart3'
  | 'chart4'
  | 'chart5'
  | 'sidebar'
  | 'sidebarForeground'
  | 'sidebarPrimary'
  | 'sidebarPrimaryForeground'
  | 'sidebarAccent'
  | 'sidebarAccentForeground'
  | 'sidebarBorder'
  | 'sidebarRing'
  | 'header'
  | 'headerForeground'
  | 'headerBorder'
  | 'glassBackground'
  | 'glassBorder'
  | 'glassHighlight'
  | 'logoBorder'
  | 'logoDark'
  | 'logoAccent'
  | 'logoDarkForeground'
  | 'logoLight'
  | 'logoLightForeground'
  | 'tabsTrack'
  | 'tabsActive'

export type ThemeTokens = Record<ThemeTokenName, string>

export const editableThemeTokenNames = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'surfaceElevated',
  'border',
  'input',
  'ring',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'destructiveForeground',
  'success',
  'successForeground',
  'warning',
  'warningForeground',
  'mediaBackground',
  'mediaForeground',
  'sidebar',
  'sidebarForeground',
  'sidebarPrimary',
  'sidebarPrimaryForeground',
  'sidebarAccent',
  'sidebarAccentForeground',
  'sidebarBorder',
  'sidebarRing',
  'header',
  'headerForeground',
  'headerBorder',
  'logoDark',
  'logoAccent',
  'logoDarkForeground',
  'logoLight',
  'logoLightForeground',
  'tabsTrack',
  'tabsActive',
  'chart1',
  'chart2',
  'chart3',
  'chart4',
  'chart5',
] as const satisfies ReadonlyArray<ThemeTokenName>

export type EditableThemeTokenName = (typeof editableThemeTokenNames)[number]

export type ThemePreset = {
  id: AppearancePresetId
  label: string
  description: string
  light: ThemeTokens
  dark: ThemeTokens
}

export type ThemeTokenOverrides = Partial<Record<EditableThemeTokenName, string>>

export type CustomThemeSettings = {
  enabled: boolean
  overrides: Partial<Record<ResolvedAppearanceMode, ThemeTokenOverrides>>
}

export type AppearanceSettings = {
  version: typeof appearanceConfigVersion
  mode: AppearanceMode
  preset: AppearancePresetId
  logoStrategy: LogoStrategy
  glassIntensity: GlassIntensity
  customTheme: CustomThemeSettings
}

export const cssVariableByToken = {
  radius: '--radius',
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  success: '--success',
  successForeground: '--success-foreground',
  warning: '--warning',
  warningForeground: '--warning-foreground',
  mediaBackground: '--media-background',
  mediaForeground: '--media-foreground',
  mediaMuted: '--media-muted',
  mediaControl: '--media-control',
  border: '--border',
  input: '--input',
  ring: '--ring',
  surfaceElevated: '--surface-elevated',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  sidebar: '--sidebar',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
  header: '--header',
  headerForeground: '--header-foreground',
  headerBorder: '--header-border',
  glassBackground: '--glass-background',
  glassBorder: '--glass-border',
  glassHighlight: '--glass-highlight',
  logoBorder: '--logo-border',
  logoDark: '--logo-dark',
  logoAccent: '--logo-accent',
  logoDarkForeground: '--logo-dark-foreground',
  logoLight: '--logo-light',
  logoLightForeground: '--logo-light-foreground',
  tabsTrack: '--tabs-track',
  tabsActive: '--tabs-active',
} satisfies Record<ThemeTokenName, `--${string}`>
