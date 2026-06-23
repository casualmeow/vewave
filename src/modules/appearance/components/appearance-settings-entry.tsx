import { Link } from '@tanstack/react-router'
import { Eye, Palette, SlidersHorizontal, Sparkles } from 'lucide-react'

import type { ReactNode } from 'react'
import { themePresets, useAppearance } from '@/shared/theme'
import { Button, Card, CardContent, CardHeader, CardTitle, DialogClose } from '@/shared/ui'

const modeLabels = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
} as const

export function AppearanceSettingsEntry({
  closeOnNavigate = false,
}: {
  closeOnNavigate?: boolean
}) {
  const { resolvedMode, settings } = useAppearance()
  const preset = themePresets.find((item) => item.id === settings.preset) ?? themePresets[0]
  const wrapNavigateAction = (children: ReactNode) =>
    closeOnNavigate ? <DialogClose asChild>{children}</DialogClose> : children

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile label="Mode" value={modeLabels[settings.mode]} />
        <SummaryTile label="Resolved" value={modeLabels[resolvedMode]} />
        <SummaryTile label="Preset" value={preset.label} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="size-4 text-primary" />
              Color studio
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Edit modes, presets, brand colors, semantic tokens, and account config persistence.
            </p>
          </CardHeader>
          <CardContent>
            {wrapNavigateAction(
              <Button asChild className="w-full">
                <Link to="/appearance/colors">
                  <Palette className="size-4" />
                  Open color studio
                </Link>
              </Button>,
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="size-4 text-primary" />
              Preview workbench
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Inspect the active theme on realistic app surfaces and jump to the tokens behind each
              selected component.
            </p>
          </CardHeader>
          <CardContent>
            {wrapNavigateAction(
              <Button asChild variant="outline" className="w-full">
                <Link to="/appearance/preview">
                  <Sparkles className="size-4" />
                  Open preview
                </Link>
              </Button>,
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}
