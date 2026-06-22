import { Link } from '@tanstack/react-router'
import { Check, Palette, SlidersHorizontal, SunMoon } from 'lucide-react'

import { DocsBody, DocsDescription, DocsPage, DocsTitle } from './docs-page-layout'
import { themePresets, useAppearance, type ResolvedAppearanceMode } from '@/shared/theme'
import { getContrastRatio, meetsNormalTextContrast } from '@/shared/theme/validators'
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui'

const tokenGroups = [
  {
    title: 'Mode',
    description: 'Light, dark, and system preference stay independent from palette choice.',
    icon: SunMoon,
  },
  {
    title: 'Preset',
    description: 'Presets resolve semantic tokens for brand color, surfaces, shell, and charts.',
    icon: Palette,
  },
  {
    title: 'Overrides',
    description:
      'Custom primary and accent colors are constrained, normalized, and contrast-checked.',
    icon: SlidersHorizontal,
  },
] as const

const resolverOrder = [
  'base semantic tokens',
  'resolved light or dark mode',
  'selected preset',
  'user overrides',
  'derived foreground and ring tokens',
  'component consumption',
] as const

export function AppearanceDocsPage() {
  const { mode, resolvedMode, settings, tokens } = useAppearance()

  return (
    <DocsPage>
      <DocsTitle>Appearance System</DocsTitle>
      <DocsDescription>
        Vewave appearance is modeled as mode, preset, and constrained user overrides. Components
        consume semantic tokens; presets decide what those tokens mean.
      </DocsDescription>

      <DocsBody>
        <div className="not-prose space-y-8">
          <section className="grid gap-4 md:grid-cols-3">
            {tokenGroups.map((group) => {
              const Icon = group.icon

              return (
                <Card key={group.title}>
                  <CardHeader>
                    <Icon className="size-5 text-primary" />
                    <CardTitle className="text-base">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">{group.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Card>
              <CardHeader>
                <CardTitle>Resolver Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="grid gap-3">
                  {resolverOrder.map((step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Runtime</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RuntimeRow label="Mode" value={`${mode} -> ${resolvedMode}`} />
                <RuntimeRow label="Preset" value={settings.preset} />
                <RuntimeRow label="Logo" value={settings.logoStrategy} />
                <RuntimeRow label="Glass" value={settings.glassIntensity} />
                <Separator />
                <ContrastRow
                  label="Primary button"
                  background={tokens.primary}
                  foreground={tokens.primaryForeground}
                />
                <ContrastRow
                  label="Accent surface"
                  background={tokens.accent}
                  foreground={tokens.accentForeground}
                />
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Presets</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Presets are token sets, not component variants. Header, Sidebar, Tabs, and shared
                  primitives should read the same semantic contract.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/profile">Open appearance settings</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {themePresets.map((preset) => (
                <Card key={preset.id}>
                  <CardHeader>
                    <CardTitle>{preset.label}</CardTitle>
                    <p className="text-sm leading-6 text-muted-foreground">{preset.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <PresetSwatches mode="light" tokens={preset.light} />
                      <PresetSwatches mode="dark" tokens={preset.dark} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </DocsBody>
    </DocsPage>
  )
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function ContrastRow({
  background,
  foreground,
  label,
}: {
  background: string
  foreground: string
  label: string
}) {
  const ratio = getContrastRatio(foreground, background)
  const passes = meetsNormalTextContrast(foreground, background)
  const ratioLabel = ratio === null ? 'n/a' : `${ratio.toFixed(2)}:1`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          {passes ? <Check className="size-3.5 text-primary" /> : null}
          {ratioLabel}
        </span>
      </div>
      <div
        className="rounded-md px-3 py-2 text-sm font-medium"
        style={{ backgroundColor: background, color: foreground }}
      >
        Sample text
      </div>
    </div>
  )
}

function PresetSwatches({
  mode,
  tokens,
}: {
  mode: ResolvedAppearanceMode
  tokens: (typeof themePresets)[number][ResolvedAppearanceMode]
}) {
  const swatches = [
    ['Background', tokens.background],
    ['Surface', tokens.card],
    ['Primary', tokens.primary],
    ['Accent', tokens.accent],
  ] as const

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {mode}
      </div>
      <div className="grid gap-2">
        {swatches.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="flex items-center gap-2 text-xs font-medium text-foreground">
              <span
                className="size-5 rounded-full border border-border"
                style={{ backgroundColor: value }}
              />
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
