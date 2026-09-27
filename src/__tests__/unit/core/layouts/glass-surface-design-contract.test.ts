import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import settingsDialogSource from '@/components/settings-dialog/settings-dialog.tsx?raw'
import appShellHeaderSource from '@/core/layouts/app-layout/ui/app-shell-header.tsx?raw'
import appearanceSectionsSource from '@/modules/settings/appearance-settings-sections.tsx?raw'
import glassSettingsSource from '@/modules/settings/glass-settings-section.tsx?raw'
import settingsPrimitivesSource from '@/modules/settings/settings-primitives.tsx?raw'
import liquidGlassHookSource from '@/shared/hooks/use-liquid-glass-refraction.tsx?raw'
import dialogSource from '@/shared/ui/dialog.tsx?raw'
import glassSurfaceSource from '@/shared/ui/glass-surface.tsx?raw'
import sheetSource from '@/shared/ui/sheet.tsx?raw'

const stylesSource = readFileSync('src/styles.css', 'utf8')

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

  it('centralizes automatic optics in the shared surface without filtering the shell', () => {
    expect(liquidGlassHookSource).toContain("'--glass-refraction-filter'")
    expect(liquidGlassHookSource).toContain('!appearance.forceFallback')
    expect(glassSurfaceSource).toContain("enabled: isGlass && !scene.ready && role !== 'shell'")
    expect(appShellHeaderSource).toContain('<GlassSurface asChild role="header"')
    expect(dialogSource).not.toContain('useLiquidGlassRefraction')
    expect(dialogSource).not.toContain('experimentalRefraction')
  })

  it('assigns dialogs and sheets their own semantic material roles', () => {
    expect(dialogSource).toContain('role="dialog"')
    expect(sheetSource).toContain('role="sheet"')
    expect(dialogSource).not.toContain("role: 'overlay'")
    expect(sheetSource).not.toContain("role: 'overlay'")
  })

  it('uses same-material settings controls instead of opaque selected islands', () => {
    expect(settingsDialogSource).toContain('Tabs.Trigger')
    expect(settingsDialogSource).toContain('data-active={active || undefined}')
    expect(settingsPrimitivesSource).toContain('glass-control-track')
    expect(settingsPrimitivesSource).not.toContain('bg-muted/40')
    expect(settingsPrimitivesSource.match(/<FluidGlassGroup\b/g)).toHaveLength(1)
    expect(settingsPrimitivesSource).toContain('<FluidGlassTarget')
    expect(settingsPrimitivesSource).toContain("behaviors={['selection']}")
    expect(settingsPrimitivesSource).toContain('aria-pressed={active}')
    expect(settingsPrimitivesSource).toContain('focus-visible:ring-2')
  })

  it('uses neutral shadows and scrims in both themes', () => {
    expect(stylesSource).toContain('--material-shadow-color: #000')
    expect(stylesSource).toContain('--material-scrim: rgb(0 0 0 / 0.2)')
    expect(stylesSource).toContain('--material-scrim: rgb(0 0 0 / 0.36)')
    expect(stylesSource).not.toMatch(/--material-scrim:[^;]*var\(--foreground\)/)
    expect(stylesSource).not.toMatch(/--glass-drop-shadow:[^;]*var\(--foreground\)/)
  })

  it('groups colors, glass, and background inside Appearance without another optics opt-in', () => {
    expect(glassSettingsSource).toContain("settings.surfaceStyle === 'glass'")
    expect(glassSettingsSource).not.toContain('experimentalRefraction')
    expect(appearanceSectionsSource).toContain("id: 'appearance'")
    expect(appearanceSectionsSource).toContain('tabs: [')
    expect(appearanceSectionsSource.indexOf("id: 'colors'")).toBeLessThan(
      appearanceSectionsSource.indexOf("id: 'glass'"),
    )
    expect(appearanceSectionsSource.indexOf("id: 'glass'")).toBeLessThan(
      appearanceSectionsSource.indexOf("id: 'background'"),
    )
  })

  it('keeps overlay motion concise and interruptible', () => {
    expect(sheetSource).toContain('transition-[transform,opacity]')
    expect(sheetSource).toContain('data-[state=closed]:translate-x-full')
    expect(sheetSource).toContain('data-[state=open]:duration-[260ms]')
    expect(sheetSource).toContain('motion-reduce:transition-none')
    expect(sheetSource).not.toContain('slide-in-from-right')
  })
})
