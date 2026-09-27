import { BackgroundSettingsControls } from '@/modules/appearance/components/background-settings-controls'
import { useAppearance } from '@/shared/theme'
import { Button } from '@/shared/ui'

export function BackgroundSettingsSection() {
  const { settings, tokens, resolvedMode, setBackground, setSurfaceStyle } = useAppearance()
  return (
    <div className="space-y-6">
      {settings.surfaceStyle === 'solid' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Your background is hidden while using Solid surfaces.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSurfaceStyle('glass')}
          >
            Use Glass
          </Button>
        </div>
      )}
      <BackgroundSettingsControls
        value={settings.background}
        onChange={setBackground}
        tokens={tokens}
        mode={resolvedMode}
      />
    </div>
  )
}
