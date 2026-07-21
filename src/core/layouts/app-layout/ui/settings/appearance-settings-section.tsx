import { Link } from '@tanstack/react-router'
import { Eye, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { toast } from 'sonner'

import { SegmentedControl, SettingRow, SettingsGroup } from './settings-primitives'
import type {
  AppearanceMode,
  GlassIntensity,
  ResolvedAppearanceMode,
  SurfaceStyle,
  ThemeTokens,
} from '@/shared/theme'
import {
  defaultAppearanceSettings,
  resolvedAppearanceModes,
  themePresets,
  useAppearance,
} from '@/shared/theme'
import { Button, DialogClose } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { supportsLiquidGlassRefraction } from '@/shared/lib/liquid-glass'

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

const surfaceStyleOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'glass', label: 'Glass' },
] as const satisfies ReadonlyArray<{ value: SurfaceStyle; label: string }>

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
    setExperimentalRefraction,
    setGlassIntensity,
    setMode,
    setPreset,
    setSurfaceStyle,
    settings,
  } = useAppearance()

  const overrideCount = resolvedAppearanceModes.reduce(
    (total, mode) => total + Object.keys(settings.customTheme.overrides[mode] ?? {}).length,
    0,
  )
  const refractionSupported = supportsLiquidGlassRefraction()

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
        <div className="grid gap-2">
          {themePresets.map((preset) => {
            const active = settings.preset === preset.id
            const isDefault = preset.id === defaultAppearanceSettings.preset

            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPreset(preset.id)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary/70 bg-primary/5 ring-1 ring-primary/40'
                    : 'border-border hover:border-ring/50',
                )}
              >
                <span className="truncate text-sm font-semibold text-foreground">
                  {preset.label}
                  {isDefault ? (
                    <span className="font-normal text-muted-foreground"> (default)</span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-3" aria-hidden>
                  <PresetModeSwatches label="Light" tokens={preset.light} />
                  <PresetModeSwatches label="Dark" tokens={preset.dark} />
                </span>
              </button>
            )
          })}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Surface details">
        <SettingRow
          title="Surface style"
          description="Solid keeps app chrome opaque. Glass renders the shell and floating layers as translucent material (experimental)."
          control={
            <SegmentedControl
              ariaLabel="Surface style"
              options={surfaceStyleOptions}
              value={settings.surfaceStyle}
              onChange={setSurfaceStyle}
            />
          }
        />
        {settings.surfaceStyle === 'glass' ? (
          <>
            <SettingRow
              title="Edge refraction"
              description={
                refractionSupported
                  ? 'Experimental: bends real content behind the shell header around its edges.'
                  : 'Unavailable in this browser. Vewave keeps the stable glass material instead.'
              }
              control={
                <Button
                  variant="outline"
                  size="sm"
                  aria-pressed={settings.experimentalRefraction}
                  disabled={!refractionSupported}
                  onClick={() => setExperimentalRefraction(!settings.experimentalRefraction)}
                >
                  {refractionSupported
                    ? settings.experimentalRefraction
                      ? 'Disable'
                      : 'Enable'
                    : 'Unavailable'}
                </Button>
              }
            />
            <SettingRow
              title="Glass intensity"
              description="How translucent floating surfaces appear — sidebar, dialogs, menus, and sheets."
              control={
                <SegmentedControl
                  ariaLabel="Glass intensity"
                  options={glassOptions}
                  value={settings.glassIntensity}
                  onChange={setGlassIntensity}
                />
              }
            />
          </>
        ) : null}
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

function PresetModeSwatches({ label, tokens }: { label: string; tokens: ThemeTokens }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1">
        <PresetSwatch color={tokens.background} />
        <PresetSwatch color={tokens.primary} />
        <PresetSwatch color={tokens.accent} />
      </span>
    </span>
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
