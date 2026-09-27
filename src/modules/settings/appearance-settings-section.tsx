import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Check } from 'lucide-react'
import { useId } from 'react'

import { SegmentedControl, SettingRow, SettingsGroup } from './settings-primitives'
import { WhiteGlassLook } from '@/modules/appearance/components/white-glass-look'
import { resolvedAppearanceModes, themePresets, useAppearance } from '@/shared/theme'
import { Button, Checkbox, DialogClose, Label } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export function AppearanceSettingsSection() {
  const id = useId()
  const {
    resolvedMode,
    setAppearanceSettings,
    setCustomThemeEnabled,
    setMode,
    setPreset,
    settings,
  } = useAppearance()
  const overrideCount = resolvedAppearanceModes.reduce(
    (total, mode) => total + Object.keys(settings.customTheme.overrides[mode] ?? {}).length,
    0,
  )

  return (
    <div className="space-y-8">
      <WhiteGlassLook settings={settings} onApply={setAppearanceSettings} />
      <SettingRow
        title="Display mode"
        searchId="mode"
        description={
          settings.mode === 'system' ? `Following your device: ${resolvedMode}.` : undefined
        }
        control={
          <SegmentedControl
            ariaLabel="Display mode"
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            value={settings.mode}
            onChange={setMode}
          />
        }
      />
      <SettingsGroup title="Palette" searchId="palette">
        <div
          role="group"
          aria-label="Color palette"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {themePresets.map((preset) => {
            const active = settings.preset === preset.id
            const tokens = preset[resolvedMode]
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                aria-label={preset.label}
                onClick={() => setPreset(preset.id)}
                className={cn(
                  'min-w-0 rounded-lg p-2.5 text-left outline-none hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring',
                  active && 'bg-foreground/[0.06] ring-1 ring-inset ring-foreground/20',
                )}
              >
                <span
                  aria-hidden="true"
                  className="mb-3 flex h-12 items-center gap-1.5 rounded-md px-2.5"
                  style={{ backgroundColor: tokens.background }}
                >
                  <span
                    className="h-7 w-2 rounded-sm"
                    style={{ backgroundColor: tokens.primary }}
                  />
                  <span className="flex flex-1 flex-col gap-1.5">
                    <span
                      className="h-1 w-3/4 rounded-full opacity-70"
                      style={{ backgroundColor: tokens.foreground }}
                    />
                    <span
                      className="h-1 w-1/2 rounded-full"
                      style={{ backgroundColor: tokens.mutedForeground }}
                    />
                  </span>
                  <span
                    className="size-5 rounded-full"
                    style={{ backgroundColor: tokens.accent }}
                  />
                </span>
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  {preset.label}
                  <Check
                    aria-hidden="true"
                    className={cn('size-3.5 shrink-0', !active && 'invisible')}
                  />
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {preset.description}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">Each palette adapts to light and dark mode.</p>
      </SettingsGroup>
      <SettingsGroup title="Custom colors" searchId="custom">
        {overrideCount > 0 ? (
          <SettingRow
            title={<Label htmlFor={`${id}-custom`}>Use custom colors</Label>}
            description={`${overrideCount} saved color ${overrideCount === 1 ? 'change' : 'changes'}. Turning this off keeps your edits.`}
            control={
              <Checkbox
                id={`${id}-custom`}
                checked={settings.customTheme.enabled}
                onCheckedChange={(checked) => setCustomThemeEnabled(checked === true)}
              />
            }
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Adjust individual colors in the color studio.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <DialogClose asChild>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appearance/colors">
                Color studio <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appearance/preview">
                Full preview <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </Button>
          </DialogClose>
        </div>
      </SettingsGroup>
    </div>
  )
}
