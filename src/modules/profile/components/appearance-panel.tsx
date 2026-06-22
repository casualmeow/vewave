import { Monitor, Moon, Palette, RotateCcw, ShieldCheck, Sparkles, Sun } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  appearanceModes,
  glassIntensities,
  logoStrategies,
  resolvedAppearanceModes,
  themePresets,
  useAppearance,
  type AppearanceMode,
  type AppearancePresetId,
  type EditableThemeTokenName,
  type GlassIntensity,
  type LogoStrategy,
  type ResolvedAppearanceMode,
} from '@/shared/theme'
import { getContrastRatio, meetsNormalTextContrast } from '@/shared/theme/validators'
import {
  Button,
  Checkbox,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/shared/ui'

const modeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} satisfies Record<AppearanceMode, string>

const modeDescriptions = {
  light: 'Always use the light token set.',
  dark: 'Always use the dark token set.',
  system: 'Follow the operating system preference.',
} satisfies Record<AppearanceMode, string>

const logoStrategyLabels = {
  auto: 'Auto',
  light: 'Light asset',
  dark: 'Dark asset',
  mono: 'Mono',
} satisfies Record<LogoStrategy, string>

const glassIntensityLabels = {
  subtle: 'Subtle',
  balanced: 'Balanced',
  strong: 'Strong',
} satisfies Record<GlassIntensity, string>

export function AppearancePanel() {
  const {
    mode,
    resetAppearance,
    resolvedMode,
    setCustomThemeEnabled,
    setCustomToken,
    setGlassIntensity,
    setLogoStrategy,
    setMode,
    setPreset,
    settings,
    tokens,
  } = useAppearance()
  const activePreset =
    themePresets.find((preset) => preset.id === settings.preset) ?? themePresets[0]
  const primaryContrast = getContrastRatio(tokens.primaryForeground, tokens.primary)
  const accentContrast = getContrastRatio(tokens.accentForeground, tokens.accent)

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingField
              label="Mode"
              description={modeDescriptions[mode]}
              icon={mode === 'dark' ? <Moon /> : mode === 'light' ? <Sun /> : <Monitor />}
            >
              <Select value={mode} onValueChange={(value) => setMode(value as AppearanceMode)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appearanceModes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {modeLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>

            <SettingField label="Preset" description={activePreset.description} icon={<Palette />}>
              <Select
                value={settings.preset}
                onValueChange={(value) => setPreset(value as AppearancePresetId)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>

            <SettingField
              label="Logo strategy"
              description="Auto can choose the asset against the resolved surface."
              icon={<ShieldCheck />}
            >
              <Select
                value={settings.logoStrategy}
                onValueChange={(value) => setLogoStrategy(value as LogoStrategy)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logoStrategies.map((option) => (
                    <SelectItem key={option} value={option}>
                      {logoStrategyLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>

            <SettingField
              label="Glass intensity"
              description="Controls shell material strength without changing colors."
              icon={<Sparkles />}
            >
              <Select
                value={settings.glassIntensity}
                onValueChange={(value) => setGlassIntensity(value as GlassIntensity)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {glassIntensities.map((option) => (
                    <SelectItem key={option} value={option}>
                      {glassIntensityLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>
          </div>

          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Constrained custom colors</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Overrides are limited to primary and accent colors. Foreground colors are derived
                  automatically for contrast.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="custom-theme-enabled"
                  checked={settings.customTheme.enabled}
                  onCheckedChange={(checked) => setCustomThemeEnabled(checked === true)}
                />
                <Label htmlFor="custom-theme-enabled" className="text-sm">
                  Enable
                </Label>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 lg:grid-cols-2">
              {resolvedAppearanceModes.map((targetMode) => (
                <div key={targetMode} className="rounded-lg border bg-card p-4">
                  <div className="text-sm font-semibold capitalize">{targetMode} overrides</div>
                  <div className="mt-4 grid gap-3">
                    <ColorControl
                      disabled={!settings.customTheme.enabled}
                      label="Primary"
                      mode={targetMode}
                      token="primary"
                      value={getEditableTokenValue(settings, targetMode, 'primary')}
                      onChange={setCustomToken}
                    />
                    <ColorControl
                      disabled={!settings.customTheme.enabled}
                      label="Accent"
                      mode={targetMode}
                      token="accent"
                      value={getEditableTokenValue(settings, targetMode, 'accent')}
                      onChange={setCustomToken}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ThemePreview
          accentContrast={accentContrast}
          primaryContrast={primaryContrast}
          resolvedMode={resolvedMode}
          tokens={tokens}
        />
      </section>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={resetAppearance}>
          <RotateCcw className="size-4" />
          Reset appearance
        </Button>
      </div>
    </div>
  )
}

function SettingField({
  children,
  description,
  icon,
  label,
}: {
  children: ReactNode
  description: string
  icon: ReactNode
  label: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary [&_svg]:size-4">{icon}</div>
        <div className="min-w-0 flex-1">
          <Label className="text-sm font-semibold">{label}</Label>
          <p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">{description}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}

function ColorControl({
  disabled,
  label,
  mode,
  onChange,
  token,
  value,
}: {
  disabled: boolean
  label: string
  mode: ResolvedAppearanceMode
  onChange: (mode: ResolvedAppearanceMode, token: EditableThemeTokenName, value: string) => void
  token: EditableThemeTokenName
  value: string
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <span className="grid grid-cols-[3rem_1fr] items-center gap-3">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(mode, token, event.target.value)}
          className="size-10 rounded-md border border-border bg-transparent disabled:opacity-50"
        />
        <span className="rounded-md border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
          {value}
        </span>
      </span>
    </label>
  )
}

function ThemePreview({
  accentContrast,
  primaryContrast,
  resolvedMode,
  tokens,
}: {
  accentContrast: number | null
  primaryContrast: number | null
  resolvedMode: ResolvedAppearanceMode
  tokens: ReturnType<typeof useAppearance>['tokens']
}) {
  return (
    <aside className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Live token preview</h3>
          <p className="mt-1 text-sm text-muted-foreground">Resolved mode: {resolvedMode}</p>
        </div>
        <div
          className="size-10 rounded-lg border"
          style={{ background: tokens.primary, borderColor: tokens.border }}
        />
      </div>

      <div
        className="mt-4 rounded-xl border p-4"
        style={{
          background: tokens.background,
          borderColor: tokens.border,
          color: tokens.foreground,
        }}
      >
        <div
          className="rounded-lg border p-4 shadow-sm"
          style={{
            background: tokens.card,
            borderColor: tokens.border,
            color: tokens.cardForeground,
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Vewave</div>
          <h4 className="mt-2 text-lg font-semibold">Operations workspace</h4>
          <p className="mt-2 text-sm leading-6" style={{ color: tokens.mutedForeground }}>
            Semantic tokens drive reusable primitives while material variants stay independent.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className="rounded-md px-3 py-2 text-sm font-medium"
              style={{ background: tokens.primary, color: tokens.primaryForeground }}
            >
              Primary action
            </span>
            <span
              className="rounded-md px-3 py-2 text-sm font-medium"
              style={{ background: tokens.accent, color: tokens.accentForeground }}
            >
              Accent state
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <ContrastRow
          label="Primary text"
          ratio={primaryContrast}
          passes={meetsNormalTextContrast(tokens.primaryForeground, tokens.primary)}
        />
        <ContrastRow
          label="Accent text"
          ratio={accentContrast}
          passes={meetsNormalTextContrast(tokens.accentForeground, tokens.accent)}
        />
      </div>
    </aside>
  )
}

function ContrastRow({
  label,
  passes,
  ratio,
}: {
  label: string
  passes: boolean
  ratio: number | null
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={passes ? 'font-medium text-success' : 'font-medium text-destructive'}>
        {ratio ? `${ratio.toFixed(2)}:1` : 'n/a'} {passes ? 'AA' : 'Review'}
      </span>
    </div>
  )
}

function getEditableTokenValue(
  settings: ReturnType<typeof useAppearance>['settings'],
  mode: ResolvedAppearanceMode,
  token: EditableThemeTokenName,
) {
  const preset = themePresets.find((item) => item.id === settings.preset) ?? themePresets[0]
  return settings.customTheme.overrides[mode]?.[token] ?? preset[mode][token]
}
