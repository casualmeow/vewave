import { useMemo, useState } from 'react'
import { UserRound } from 'lucide-react'

import { createControlledTextureUrl } from './fluid-glass-calibration'
import type { GlassMotion } from '@/shared/theme'
import { FluidGlassGroup, FluidGlassTarget } from '@/components/fluid-glass'
import { useLensPaneDebug } from '@/components/fluid-glass/lens/pane-debug'
import { SettingsDialogContent } from '@/components/settings-dialog'
import { appearanceSettingsSections, AccountSettingsSection } from '@/modules/settings'
import { Button, Dialog, DialogTrigger } from '@/shared/ui'

function SourceStatus() {
  const state = useLensPaneDebug()
  return (
    <p className="pointer-events-none absolute right-4 top-4 rounded-md bg-background/90 px-2 py-1 text-xs text-foreground">
      {state?.resolvedBackend} · {state?.reason}
    </p>
  )
}

export function FluidGlassSourceComparison() {
  const [source, setSource] = useState<'dom' | 'transmission'>('dom')
  const [tone, setTone] = useState<'light' | 'dark'>('light')
  const [active, setActive] = useState('Overview')
  const [fallback, setFallback] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [motion, setMotion] = useState<'auto' | GlassMotion>('auto')
  const [settingsSection, setSettingsSection] = useState('appearance')
  const image = useMemo(() => createControlledTextureUrl(tone), [tone])

  return (
    <section aria-label="Glass backdrop comparison" className="border-b border-border p-5">
      <h3 className="text-lg font-semibold">One lens, two backdrop sources</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Live HTML uses native edge refraction where supported. The 3D reference samples a controlled
        image containing a grid and text. Foreground buttons stay sharp in both modes.
      </p>
      <div className="my-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          Backdrop
          <select
            className="rounded border border-border bg-background p-2"
            value={source}
            onChange={(event) => setSource(event.target.value as typeof source)}
          >
            <option value="dom">Live HTML</option>
            <option value="transmission">Controlled transmission</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Tone
          <select
            className="rounded border border-border bg-background p-2"
            value={tone}
            onChange={(event) => setTone(event.target.value as typeof tone)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Motion
          <select
            className="rounded border border-border bg-background p-2"
            value={motion}
            onChange={(event) => setMotion(event.target.value as typeof motion)}
          >
            <option value="auto">Use appearance setting</option>
            <option value="off">Off</option>
            <option value="subtle">Subtle</option>
            <option value="fluid">Fluid</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={fallback}
            onChange={(event) => setFallback(event.target.checked)}
          />
          CSS fallback
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
          Reduced motion
        </label>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" aria-describedby="modal-glass-preview-description">
              Open settings preview
            </Button>
          </DialogTrigger>
          <SettingsDialogContent
            value={settingsSection}
            onValueChange={setSettingsSection}
            sections={[
              ...appearanceSettingsSections,
              {
                id: 'account',
                label: 'Account',
                description: 'Your account and session.',
                icon: <UserRound />,
                content: <AccountSettingsSection />,
              },
            ]}
          />
        </Dialog>
      </div>
      <p
        id="modal-glass-preview-description"
        className="mb-4 max-w-2xl text-sm text-muted-foreground"
      >
        The Settings preview uses your saved appearance preferences. Choose Glass to compare its
        frosted center and clearer rim against this page; Fluid motion lets the edge yield as your
        pointer approaches. The page outside the dialog stays sharp. The controls above apply to the
        lens comparison below.
      </p>
      <div
        className={`relative overflow-hidden rounded-xl border border-border ${tone === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-950'}`}
      >
        {source === 'dom' ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid content-center gap-4 p-5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent 0 39px, #64748b40 39px 40px), repeating-linear-gradient(0deg, transparent 0 39px, #64748b40 39px 40px)',
            }}
          >
            <p className="text-4xl font-semibold tracking-tight">Light through a surface</p>
            <p className="font-mono text-sm">Live HTML · 01 / 02 / 03 / 04 / 05 / 06</p>
          </div>
        ) : null}
        <FluidGlassGroup
          activation="always"
          environment={source === 'dom' ? { type: 'auto-dom' } : { type: 'image', src: image }}
          renderer={source === 'dom' ? 'auto' : 'transmission-experimental'}
          forceFallback={fallback}
          simulateReducedMotion={reducedMotion}
          motion={motion}
          className="min-h-60"
          contentClassName="flex min-h-60 items-center justify-center gap-2 overflow-x-auto p-5"
        >
          <SourceStatus />
          {['Overview', 'Scene library', 'People'].map((label) => (
            <FluidGlassTarget
              key={label}
              id={`source-${label}`}
              active={active === label}
              behaviors={['selection']}
              asChild
              radius="inherit"
            >
              <button
                type="button"
                aria-pressed={active === label}
                onClick={() => setActive(label)}
                className="shrink-0 rounded-lg px-4 py-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                {label}
              </button>
            </FluidGlassTarget>
          ))}
        </FluidGlassGroup>
      </div>
    </section>
  )
}
