import { SegmentedControl, SettingRow } from './settings-primitives'
import { WhiteGlassLook } from '@/modules/appearance/components/white-glass-look'
import { useAppearance } from '@/shared/theme'

export function GlassSettingsSection() {
  const { settings, setSurfaceStyle, setGlassIntensity, setGlassMotion, setAppearanceSettings } =
    useAppearance()
  return (
    <div className="space-y-7">
      <WhiteGlassLook settings={settings} onApply={setAppearanceSettings} />
      <SettingRow
        title="Surface style"
        searchId="surface"
        description="Glass reveals your background through the app and floating panels."
        control={
          <SegmentedControl
            ariaLabel="Surface style"
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'glass', label: 'Glass' },
            ]}
            value={settings.surfaceStyle}
            onChange={setSurfaceStyle}
          />
        }
      />
      {settings.surfaceStyle === 'glass' && (
        <>
          <SettingRow
            title="Glass intensity"
            searchId="intensity"
            description="Changes the frosting and curved edges."
            control={
              <SegmentedControl
                ariaLabel="Glass intensity"
                options={[
                  { value: 'subtle', label: 'Subtle' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'strong', label: 'Strong' },
                ]}
                value={settings.glassIntensity}
                onChange={setGlassIntensity}
              />
            }
          />
          <SettingRow
            title="Glass motion"
            searchId="glass-motion"
            description="Choose how glass responds to selections, presses, and pointer movement."
            control={
              <SegmentedControl
                ariaLabel="Glass motion"
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'subtle', label: 'Subtle' },
                  { value: 'fluid', label: 'Fluid' },
                ]}
                value={settings.glassMotion}
                onChange={setGlassMotion}
              />
            }
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Reduced motion and keyboard navigation keep the glass still.
          </p>
        </>
      )}
    </div>
  )
}
