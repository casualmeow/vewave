import { useId } from 'react'
import { SegmentedControl, SettingRow, SettingsGroup } from '@/modules/settings/settings-primitives'
import {
  backgroundPresets,
  type BackgroundSettings,
  type ResolvedAppearanceMode,
  type ThemeTokens,
} from '@/shared/theme'
import { BackdropPreview } from '@/components/app-backdrop'

const presetLabels = { none: 'None', ribbons: 'Ribbons', silk: 'Silk', contours: 'Contours' }

export function BackgroundSettingsControls({
  value,
  onChange,
  tokens,
  mode,
}: {
  value: BackgroundSettings
  onChange: (patch: Partial<BackgroundSettings>) => void
  tokens: ThemeTokens
  mode: ResolvedAppearanceMode
}) {
  const id = useId()
  return (
    <SettingsGroup title="Scene" searchId="scene">
      <SegmentedControl
        ariaLabel="Background preset"
        options={backgroundPresets.map((preset) => ({
          value: preset,
          label: presetLabels[preset],
        }))}
        value={value.preset}
        onChange={(preset) => onChange({ preset })}
      />
      {value.preset === 'none' && (
        <p className="py-3 text-sm text-muted-foreground">
          No background. Your theme supplies the workspace color.
        </p>
      )}
      {value.preset !== 'none' && (
        <>
          <BackdropPreview settings={value} tokens={tokens} mode={mode} />
          <SettingRow
            title="Palette"
            searchId="background-palette"
            description="Colors stay balanced with your theme for readable text."
            control={
              <SegmentedControl
                ariaLabel="Background palette"
                options={[
                  { value: 'theme', label: 'Theme' },
                  { value: 'custom', label: 'Custom' },
                ]}
                value={value.palette}
                onChange={(nextPalette) => onChange({ palette: nextPalette })}
              />
            }
          />
          {value.palette === 'custom' && (
            <div className="flex flex-wrap gap-4">
              {([0, 1] as const).map((index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <input
                    type="color"
                    aria-label={`Background color ${index + 1}`}
                    value={value.colors[index]}
                    onChange={(event) => {
                      const colors: [string, string] = [...value.colors]
                      colors[index] = event.target.value
                      onChange({ colors })
                    }}
                    className="size-10 cursor-pointer rounded-lg border border-border/60 bg-transparent p-1 focus-visible:outline-2 focus-visible:outline-ring"
                  />
                  Color {index + 1}
                </label>
              ))}
            </div>
          )}
          <SettingRow
            title={<label htmlFor={`${id}-brightness`}>Brightness</label>}
            searchId="brightness"
            control={
              <div className="flex items-center gap-3">
                <input
                  id={`${id}-brightness`}
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(value.brightness * 100)}
                  onChange={(event) => onChange({ brightness: Number(event.target.value) / 100 })}
                  className="h-9 w-32 accent-primary"
                />
                <output
                  htmlFor={`${id}-brightness`}
                  className="w-10 text-right text-xs tabular-nums text-muted-foreground"
                >
                  {Math.round(value.brightness * 100)}%
                </output>
              </div>
            }
          />
          <SettingRow
            title="Background motion"
            searchId="background-motion"
            description="Pauses in rooms and respects reduced motion."
            control={
              <SegmentedControl
                ariaLabel="Background motion"
                options={[
                  { value: 'still', label: 'Still' },
                  { value: 'animated', label: 'Animated' },
                ]}
                value={value.animated ? 'animated' : 'still'}
                onChange={(motion) => onChange({ animated: motion === 'animated' })}
              />
            }
          />
          {value.animated && (
            <SettingRow
              title={<label htmlFor={`${id}-speed`}>Speed</label>}
              control={
                <div className="flex items-center gap-3">
                  <input
                    id={`${id}-speed`}
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(value.speed * 100)}
                    onChange={(event) => onChange({ speed: Number(event.target.value) / 100 })}
                    className="h-9 w-32 accent-primary"
                  />
                  <output
                    htmlFor={`${id}-speed`}
                    className="w-10 text-right text-xs tabular-nums text-muted-foreground"
                  >
                    {Math.round(value.speed * 100)}%
                  </output>
                </div>
              }
            />
          )}
        </>
      )}
    </SettingsGroup>
  )
}
