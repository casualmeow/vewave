import { useMemo, useState } from 'react'

import { createControlledTextureUrl } from './fluid-glass-calibration'
// Lab-only deep import: the shader-mode override is deliberately not part of
// the fluid-glass public barrel so production surfaces cannot reach it.
import {
  TransmissionShaderModeContext,
  type TransmissionShaderMode,
} from '@/components/fluid-glass/renderer/fluid-glass-transmission-renderer'
import {
  FluidGlassGroup,
  FluidGlassTarget,
  type FluidGlassBackend,
  type FluidGlassMaterial,
  type FluidGlassRendererSelection,
  type FluidTransmissionMaterial,
} from '@/components/fluid-glass'
import { cn } from '@/shared/lib/utils'

const comparisonTabs = ['Overview', 'Scene library', 'People'] as const

// Every comparison pane surrounds the same fixed tab so SDF and Transmission
// captures stay directly comparable regardless of the lab's live selection.
const fixedComparisonTarget = 'Scene library' satisfies (typeof comparisonTabs)[number]

function BackendMark({ backend }: { backend: FluidGlassBackend }) {
  return (
    <span className="rounded-full bg-black/75 px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white">
      {backend === 'transmission' ? 'Transmission' : backend === 'sdf' ? 'SDF' : 'CSS'}
    </span>
  )
}

function ComparisonPane({
  environmentUrl,
  lightDirection,
  material,
  renderer,
  transmissionMaterial,
  validationId,
}: {
  environmentUrl: string
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  renderer: FluidGlassRendererSelection
  transmissionMaterial: FluidTransmissionMaterial
  validationId?: string
}) {
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const environment = useMemo(
    () => ({ type: 'image' as const, src: environmentUrl }),
    [environmentUrl],
  )

  return (
    <div className="grid min-w-0 gap-2" data-fluid-glass-validation={validationId}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {renderer === 'transmission-experimental' ? 'Transmission lens' : 'Custom SDF lens'}
        </p>
        <BackendMark backend={backend} />
      </div>
      <FluidGlassGroup
        activation="always"
        debugView="final"
        environment={environment}
        lightDirection={lightDirection}
        material={material}
        materialPreset="expressive"
        onBackendChange={setBackend}
        quality="high"
        renderer={renderer}
        transmissionMaterial={transmissionMaterial}
        className="h-40 rounded-2xl"
        contentClassName="flex h-40 items-center justify-center px-5"
      >
        <div
          role="tablist"
          aria-label={`${renderer === 'transmission-experimental' ? 'Transmission' : 'SDF'} material tabs`}
          className="flex items-center gap-1"
        >
          {comparisonTabs.map((tab) => {
            const active = tab === fixedComparisonTarget
            return (
              <FluidGlassTarget
                key={tab}
                id={`comparison-${renderer}-${tab}`}
                scopeId="tabs"
                active={active}
                shape="capsule"
                asChild
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled
                  className={cn(
                    'h-10 appearance-none rounded-full border-0 bg-transparent px-4 text-sm font-medium text-white shadow-none outline-none',
                    'focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  )}
                >
                  {tab}
                </button>
              </FluidGlassTarget>
            )
          })}
        </div>
      </FluidGlassGroup>
    </div>
  )
}

function ShaderModePane({
  environmentUrl,
  lightDirection,
  material,
  shaderMode,
  transmissionMaterial,
}: {
  environmentUrl: string
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  shaderMode: TransmissionShaderMode
  transmissionMaterial: FluidTransmissionMaterial
}) {
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const environment = useMemo(
    () => ({ type: 'image' as const, src: environmentUrl }),
    [environmentUrl],
  )

  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {shaderMode === 'stock' ? 'Stock drei transmission' : 'Custom patched transmission'}
        </p>
        <BackendMark backend={backend} />
      </div>
      <TransmissionShaderModeContext.Provider value={shaderMode}>
        <FluidGlassGroup
          activation="always"
          debugView="final"
          environment={environment}
          lightDirection={lightDirection}
          material={material}
          materialPreset="expressive"
          onBackendChange={setBackend}
          quality="high"
          renderer="transmission-experimental"
          transmissionMaterial={transmissionMaterial}
          className="h-40 rounded-2xl"
          contentClassName="flex h-40 items-center justify-center px-5"
        >
          <div
            role="tablist"
            aria-label={`${shaderMode === 'stock' ? 'Stock' : 'Custom'} transmission shader tabs`}
            className="flex items-center gap-1"
          >
            {comparisonTabs.map((tab) => {
              const active = tab === fixedComparisonTarget
              return (
                <FluidGlassTarget
                  key={tab}
                  id={`comparison-shader-${shaderMode}-${tab}`}
                  scopeId="tabs"
                  active={active}
                  shape="capsule"
                  asChild
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled
                    className={cn(
                      'h-10 appearance-none rounded-full border-0 bg-transparent px-4 text-sm font-medium text-white shadow-none outline-none',
                      'focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    )}
                  >
                    {tab}
                  </button>
                </FluidGlassTarget>
              )
            })}
          </div>
        </FluidGlassGroup>
      </TransmissionShaderModeContext.Provider>
    </div>
  )
}

export function FluidGlassTabComparison({
  lightDirection,
  material,
  transmissionMaterial,
}: {
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  transmissionMaterial: FluidTransmissionMaterial
}) {
  const environmentUrl = useMemo(() => createControlledTextureUrl('dark'), [])
  if (!environmentUrl) return null

  return (
    <section
      data-fluid-glass-tab-comparison
      className="rounded-2xl border border-border/70 bg-muted/20 p-3 sm:p-4"
    >
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Clean tab-material comparison
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Shared target geometry, texture, DPR, radius, and sharp DOM labels. Both panes are fixed
          on the {fixedComparisonTarget} target.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ComparisonPane
          environmentUrl={environmentUrl}
          lightDirection={lightDirection}
          material={material}
          renderer="auto"
          transmissionMaterial={transmissionMaterial}
          validationId="scene-library-sdf"
        />
        <ComparisonPane
          environmentUrl={environmentUrl}
          lightDirection={lightDirection}
          material={material}
          renderer="transmission-experimental"
          transmissionMaterial={transmissionMaterial}
        />
      </div>
      <div className="mb-3 mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Transmission shader comparison
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Untouched drei MeshTransmissionMaterial vs the custom patched shader. Both panes are fixed
          on the {fixedComparisonTarget} target.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ShaderModePane
          environmentUrl={environmentUrl}
          lightDirection={lightDirection}
          material={material}
          shaderMode="stock"
          transmissionMaterial={transmissionMaterial}
        />
        <ShaderModePane
          environmentUrl={environmentUrl}
          lightDirection={lightDirection}
          material={material}
          shaderMode="custom"
          transmissionMaterial={transmissionMaterial}
        />
      </div>
    </section>
  )
}
