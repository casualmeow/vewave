import { useMemo, useState } from 'react'

import { createControlledTextureUrl } from './fluid-glass-calibration'

import {
  TransmissionShaderModeContext,
  type TransmissionShaderMode,
} from '@/components/fluid-glass/renderer/fluid-glass-transmission-renderer'
import {
  FluidGlassGroup,
  FluidGlassTarget,
  type FluidGlassBackend,
  type FluidGlassEnvironmentSource,
  type FluidGlassRendererSelection,
} from '@/components/fluid-glass'
import { cn } from '@/shared/lib/utils'

const sharedShaderMaterial = { ior: 1.45, thickness: 1.05, chromaticAberration: 0.26 }

const paneClass = 'h-[150px] w-[360px] rounded-2xl border border-white/10'
const contentClass = 'relative flex h-[150px] items-center justify-center px-5'

function AcceptancePane({
  environment,
  forceFallback = false,
  label,
  renderer,
  targetLabel,
  transmissionOverrides,
  validationId,
}: {
  environment: FluidGlassEnvironmentSource
  forceFallback?: boolean
  label: string
  renderer: FluidGlassRendererSelection
  targetLabel: string
  transmissionOverrides?: typeof sharedShaderMaterial
  validationId: string
}) {
  const [backend, setBackend] = useState<FluidGlassBackend>('css')

  return (
    <div className="grid gap-1" data-fluid-glass-validation={validationId}>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label} · <span data-acceptance-backend>{backend}</span>
      </p>
      <FluidGlassGroup
        activation="always"
        debugView="final"
        environment={environment}
        forceFallback={forceFallback}
        materialPreset="expressive"
        onBackendChange={setBackend}
        quality="high"
        renderer={renderer}
        transmissionMaterial={transmissionOverrides}
        className={paneClass}
        contentClassName={contentClass}
      >
        <FluidGlassTarget
          id={`${validationId}-target`}
          scopeId={validationId}
          shape="capsule"
          active
          asChild
        >
          <button
            type="button"
            aria-selected
            role="tab"
            className={cn(
              'h-10 appearance-none rounded-full border-0 bg-transparent px-5 text-sm font-semibold',
              'text-white shadow-none outline-none',
            )}
          >
            {targetLabel}
          </button>
        </FluidGlassTarget>
      </FluidGlassGroup>
    </div>
  )
}

export function FluidGlassAcceptanceScene() {
  const controlledTexture = useMemo(() => createControlledTextureUrl('dark'), [])
  const imageEnvironment = useMemo(
    () => ({ type: 'image' as const, src: controlledTexture }),
    [controlledTexture],
  )
  if (!controlledTexture) return null

  return (
    <section
      data-fluid-glass-acceptance-scene
      className="grid w-fit grid-cols-3 gap-4 bg-background p-4"
    >
      <AcceptancePane
        validationId="acceptance-main-sdf"
        label="main dark sdf"
        renderer="auto"
        environment={{ type: 'theme', pattern: 'grid', tone: 'dark' }}
        targetLabel="Scene library"
      />

      <AcceptancePane
        validationId="acceptance-comparison-sdf"
        label="comparison sdf"
        renderer="auto"
        environment={imageEnvironment}
        targetLabel="Scene library"
      />
      <div data-fluid-glass-validation="acceptance-css-wrapper">
        <AcceptancePane
          validationId="acceptance-css"
          label="css fallback"
          renderer="auto"
          forceFallback
          environment={{ type: 'theme', pattern: 'grid', tone: 'light' }}
          targetLabel="Scene library"
        />
      </div>
      <TransmissionShaderModeContext.Provider value={'stock' satisfies TransmissionShaderMode}>
        <AcceptancePane
          validationId="acceptance-stock"
          label="stock transmission"
          renderer="transmission-experimental"
          environment={imageEnvironment}
          transmissionOverrides={sharedShaderMaterial}
          targetLabel="Scene library"
        />
      </TransmissionShaderModeContext.Provider>
      <TransmissionShaderModeContext.Provider value={'custom' satisfies TransmissionShaderMode}>
        <AcceptancePane
          validationId="acceptance-patched"
          label="patched transmission"
          renderer="transmission-experimental"
          environment={imageEnvironment}
          transmissionOverrides={sharedShaderMaterial}
          targetLabel="Scene library"
        />
      </TransmissionShaderModeContext.Provider>
    </section>
  )
}
