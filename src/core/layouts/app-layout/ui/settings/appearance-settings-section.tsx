import { Link } from '@tanstack/react-router'
import { Eye, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { toast } from 'sonner'

import { SegmentedControl, SettingRow, SettingsGroup } from './settings-primitives'
import type {
  AppearanceMode,
  GlassIntensity,
  LogoStrategy,
  ResolvedAppearanceMode,
} from '@/shared/theme'
import { resolvedAppearanceModes, themePresets, useAppearance } from '@/shared/theme'
import { Button, DialogClose } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

const modeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const satisfies ReadonlyArray<{ value: AppearanceMode; label: string; icon: typeof Sun }>

const glassOptions = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'strong', label: 'Strong' },
] as const satisfies ReadonlyArray<{ value: GlassIntensity; label: string }>

const logoOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'mono', label: 'Mono' },
] as const satisfies ReadonlyArray<{ value: LogoStrategy; label: string }>

const resolvedModeLabels: Record<ResolvedAppearanceMode, string> = {
  light: 'Light',
  dark: 'Dark',
}

export function AppearanceSettingsSection() {
  const {
    resetAppearance,
    resetCustomTheme,
    resolvedMode,
    setCustomThemeEnabled,
    setGlassIntensity,
    setLogoStrategy,
    setMode,
    setPreset,
    settings,
  } = useAppearance()

  const overrideCount = resolvedAppearanceModes.reduce(
    (total, mode) => total + Object.keys(settings.customTheme.overrides[mode] ?? {}).length,
    0,
  )

  return (
    <div className="grid gap-6">
      <SettingsGroup title="Mode">
        <SettingRow
          title="Interface mode"
          description={
            settings.mode === 'system'
              ? `Follows your device and currently resolves to ${resolvedModeLabels[resolvedMode]}.`
              : 'Applies across every Vewave surface immediately.'
          }
          control={
            <SegmentedControl
              ariaLabel="Interface mode"
              options={modeOptions}
              value={settings.mode}
              onChange={setMode}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Theme preset">
        <div className="grid gap-2 sm:grid-cols-2">
          {themePresets.map((preset) => {
            const active = settings.preset === preset.id

            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPreset(preset.id)}
                className={cn(
                  'rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary/70 bg-primary/5 ring-1 ring-primary/40'
                    : 'border-border hover:border-ring/50',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{preset.label}</span>
                  <span className="flex items-center gap-1" aria-hidden>
                    <PresetSwatch color={preset.light.primary} />
                    <PresetSwatch color={preset.light.background} />
                    <PresetSwatch color={preset.dark.background} />
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{preset.description}</p>
              </button>
            )
          })}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Surface details">
        <SettingRow
          title="Glass intensity"
          description="How pronounced translucent surfaces such as the sidebar appear."
          control={
            <SegmentedControl
              ariaLabel="Glass intensity"
              options={glassOptions}
              value={settings.glassIntensity}
              onChange={setGlassIntensity}
            />
          }
        />
        <SettingRow
          title="Logo treatment"
          description="Which brand mark variant renders on identity-bearing surfaces."
          control={
            <SegmentedControl
              ariaLabel="Logo treatment"
              options={logoOptions}
              value={settings.logoStrategy}
              onChange={setLogoStrategy}
            />
          }
        />
        <SettingRow
          title="Custom theme overrides"
          description={
            settings.customTheme.enabled
              ? `${overrideCount} token override${overrideCount === 1 ? '' : 's'} applied on top of the preset. Edit them in the color studio.`
              : 'Preset tokens are used as-is. Enable to apply your color studio overrides.'
          }
          control={
            <>
              {overrideCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetCustomTheme()
                    toast.success('Custom token overrides cleared')
                  }}
                >
                  Clear overrides
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomThemeEnabled(!settings.customTheme.enabled)}
              >
                {settings.customTheme.enabled ? 'Disable' : 'Enable'}
              </Button>
            </>
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Theme studio">
        <div className="grid gap-2 sm:grid-cols-2">
          <DialogClose asChild>
            <Button asChild variant="outline">
              <Link to="/appearance/colors">
                <Palette className="size-4" />
                Open color studio
              </Link>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button asChild variant="outline">
              <Link to="/appearance/preview">
                <Eye className="size-4" />
                Open preview workbench
              </Link>
            </Button>
          </DialogClose>
        </div>
        <SettingRow
          title="Reset appearance"
          description="Restore mode, preset, surface details, and overrides to defaults."
          control={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetAppearance()
                toast.success('Appearance reset to defaults')
              }}
            >
              Reset
            </Button>
          }
        />
      </SettingsGroup>
    </div>
  )
}

function PresetSwatch({ color }: { color: string }) {
  return (
    <span
      className="size-3.5 rounded-full border border-border/70"
      style={{ backgroundColor: color }}
    />
  )
}
