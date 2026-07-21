import { describe, expect, it } from 'vitest'

import appSettingsDialogSource from '@/core/layouts/app-layout/ui/app-settings-dialog.tsx?raw'
import appShellHeaderSource from '@/core/layouts/app-layout/ui/app-shell-header.tsx?raw'
import appearanceSettingsSource from '@/core/layouts/app-layout/ui/settings/appearance-settings-section.tsx?raw'
import settingsPrimitivesSource from '@/core/layouts/app-layout/ui/settings/settings-primitives.tsx?raw'
import liquidGlassHookSource from '@/shared/hooks/use-liquid-glass-refraction.tsx?raw'
import dialogSource from '@/shared/ui/dialog.tsx?raw'
import glassSurfaceSource from '@/shared/ui/glass-surface.tsx?raw'
import sheetSource from '@/shared/ui/sheet.tsx?raw'

describe('semantic glass surface design contract', () => {
  it('keeps surface, role, and material as independent axes', () => {
    expect(glassSurfaceSource).toContain("surface: 'auto'")
    expect(glassSurfaceSource).toContain("role: 'none'")
    expect(glassSurfaceSource).toContain("dialog: 'glass-role-dialog'")
    expect(glassSurfaceSource).toContain("sheet: 'glass-role-sheet'")
    expect(glassSurfaceSource).toContain("menu: 'glass-role-menu'")
    expect(glassSurfaceSource).toContain("material: 'glass'")
    expect(glassSurfaceSource).toContain("liquidGlass: 'glass-material-liquid'")
  })

  it('keeps experimental refraction opt-in and scoped to the shell header prototype', () => {
    expect(liquidGlassHookSource).toContain("'--glass-experimental-filter'")
    expect(liquidGlassHookSource).toContain("dataset.glassCapability === 'fallback'")
    expect(appShellHeaderSource).toContain('data-liquid-glass-active')
    expect(appShellHeaderSource).toContain("refraction.active && 'glass-material-liquid'")
    expect(dialogSource).not.toContain('useLiquidGlassRefraction')
    expect(dialogSource).not.toContain('experimentalRefraction')
  })

  it('assigns dialogs and sheets their own semantic material roles', () => {
    expect(dialogSource).toContain("role: 'dialog'")
    expect(sheetSource).toContain("role: 'sheet'")
    expect(dialogSource).not.toContain("role: 'overlay'")
    expect(sheetSource).not.toContain("role: 'overlay'")
  })

  it('uses same-material settings controls instead of opaque selected islands', () => {
    expect(appSettingsDialogSource).toContain("aria-current={active ? 'page' : undefined}")
    expect(appSettingsDialogSource).toContain('data-active={active || undefined}')
    expect(settingsPrimitivesSource).toContain('glass-control-track')
    expect(settingsPrimitivesSource).not.toContain('bg-muted/40')
  })

  it('gates glass-only settings by surface style and browser capability', () => {
    expect(appearanceSettingsSource).toContain("settings.surfaceStyle === 'glass'")
    expect(appearanceSettingsSource).toContain('supportsLiquidGlassRefraction()')
    expect(appearanceSettingsSource).toContain('disabled={!refractionSupported}')
    expect(appearanceSettingsSource).toContain('aria-pressed={settings.experimentalRefraction}')
    expect(appearanceSettingsSource).toContain("'Unavailable'")
  })

  it('keeps overlay motion concise and interruptible', () => {
    expect(sheetSource).toContain('transition-[transform,opacity]')
    expect(sheetSource).toContain('data-[state=closed]:translate-x-full')
    expect(sheetSource).toContain('data-[state=open]:duration-[260ms]')
    expect(sheetSource).toContain('motion-reduce:transition-none')
    expect(sheetSource).not.toContain('slide-in-from-right')
  })
})
