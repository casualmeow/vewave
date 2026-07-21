import { useMemo, useState, type ComponentProps } from 'react'

import {
  FluidGlassGroup,
  FluidGlassTarget,
  type FluidGlassDebugView,
  type FluidGlassMaterial,
  type FluidGlassTelemetry,
  type FluidTransmissionMaterial,
} from '@/components/fluid-glass'
import { cn } from '@/shared/lib/utils'

export type FluidGlassCalibrationMode =
  | 'baseline'
  | 'raw-fbo'
  | 'fbo-overlay'
  | 'transmission'
  | 'fbo-difference'

type CalibrationTone = 'dark' | 'light'
type CalibrationBackend = 'baseline' | 'transmission'

export function createControlledTextureUrl(tone: CalibrationTone) {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 360
  const context = canvas.getContext('2d')
  if (!context) return ''

  const light = tone === 'light'
  context.fillStyle = light ? '#e8eeee' : '#0b121a'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.lineWidth = 1
  context.strokeStyle = light ? 'rgba(48, 70, 76, 0.24)' : 'rgba(135, 160, 171, 0.25)'
  for (let x = 0; x <= canvas.width; x += 60) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, canvas.height)
    context.stroke()
  }
  for (let y = 0; y <= canvas.height; y += 60) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(canvas.width, y)
    context.stroke()
  }

  context.lineWidth = 2
  context.strokeStyle = light ? 'rgba(28, 47, 52, 0.68)' : 'rgba(224, 238, 242, 0.62)'
  context.beginPath()
  context.moveTo(150, canvas.height)
  context.lineTo(570, 0)
  context.stroke()

  context.lineWidth = 3
  context.strokeStyle = light ? '#008ca6' : '#35d7f2'
  context.beginPath()
  context.moveTo(canvas.width / 2, 0)
  context.lineTo(canvas.width / 2, canvas.height)
  context.stroke()

  context.strokeStyle = light ? 'rgba(0, 91, 108, 0.76)' : 'rgba(61, 193, 215, 0.78)'
  context.beginPath()
  context.moveTo(0, canvas.height / 2)
  context.lineTo(canvas.width, canvas.height / 2)
  context.stroke()

  context.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  let intersection = 1
  for (let y = 60; y < canvas.height; y += 60) {
    for (let x = 60; x < canvas.width; x += 60) {
      context.fillStyle = light ? 'rgba(32, 53, 58, 0.78)' : 'rgba(218, 235, 239, 0.72)'
      context.fillText(String(intersection), x + 10, y - 10)
      intersection += 1
    }
  }

  return canvas.toDataURL('image/png')
}

function CalibrationLensSurface({ className, ref, ...divProps }: ComponentProps<'div'>) {
  return (
    <div
      {...divProps}
      ref={ref}
      aria-hidden="true"
      data-fluid-glass-calibration-target
      className={cn('h-14 w-40 select-none rounded-full', className)}
    />
  )
}

function CalibrationPane({
  backend,
  debugView,
  lightDirection,
  material,
  onTelemetry,
  telemetry,
  showBounds,
  textureUrl,
  transmissionMaterial,
}: {
  backend: CalibrationBackend
  debugView: FluidGlassDebugView
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
  telemetry?: FluidGlassTelemetry | null
  showBounds: boolean
  textureUrl: string
  transmissionMaterial: FluidTransmissionMaterial
}) {
  const environment = useMemo(() => ({ type: 'image' as const, src: textureUrl }), [textureUrl])
  const surfaceStyle = {
    backgroundImage: `url(${JSON.stringify(textureUrl)})`,
    backgroundSize: '100% 100%',
  }

  if (backend === 'baseline') {
    return (
      <div
        data-fluid-glass-calibration-surface="baseline"
        className="grid h-52 place-items-center overflow-hidden rounded-2xl"
        style={surfaceStyle}
      >
        <CalibrationLensSurface />
      </div>
    )
  }

  return (
    <div
      data-fluid-glass-calibration-surface={backend}
      className="relative h-52 overflow-hidden rounded-2xl"
      style={surfaceStyle}
    >
      <FluidGlassGroup
        activation="always"
        debugView={debugView}
        environment={environment}
        quality="high"
        renderer="transmission-experimental"
        materialPreset="expressive"
        material={material}
        transmissionMaterial={transmissionMaterial}
        lightDirection={lightDirection}
        onTelemetry={onTelemetry}
        className="h-full overflow-hidden rounded-2xl"
        contentClassName="grid h-full place-items-center"
      >
        <FluidGlassTarget
          id={`calibration-${backend}`}
          scopeId="calibration"
          shape="capsule"
          active
          behaviors={['static']}
          asChild
        >
          <CalibrationLensSurface />
        </FluidGlassTarget>
      </FluidGlassGroup>
      {showBounds && telemetry ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute border border-cyan-300"
            style={{
              height: telemetry.targetCssHeight,
              left: telemetry.targetDomX,
              top: telemetry.targetDomY,
              width: telemetry.targetCssWidth,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute border border-fuchsia-400"
            style={{
              height: telemetry.projectedMeshHeight,
              left: telemetry.projectedMeshX,
              top: telemetry.projectedMeshY,
              width: telemetry.projectedMeshWidth,
            }}
          />
          <div className="pointer-events-none absolute bottom-2 left-2 flex gap-2 rounded-md bg-black/70 px-2 py-1 font-mono text-[0.6rem] text-white">
            <span className="text-cyan-300">DOM</span>
            <span className="text-fuchsia-300">projected mesh</span>
          </div>
        </>
      ) : null}
    </div>
  )
}

function CalibrationPaneLabel({
  backend,
  children,
}: {
  backend: CalibrationBackend
  children: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-fit rounded-full border border-border/70 bg-background/75 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </span>
      <span className="rounded-full bg-foreground px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-background">
        {backend === 'transmission' ? 'Transmission' : 'CSS'}
      </span>
    </div>
  )
}

export function FluidGlassCalibration({
  debugView,
  lightDirection,
  material,
  mode,
  showInteractionDiagnostics = false,
  transmissionMaterial,
}: {
  debugView: FluidGlassDebugView
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  mode: FluidGlassCalibrationMode
  showInteractionDiagnostics?: boolean
  transmissionMaterial: FluidTransmissionMaterial
}) {
  const [tone, setTone] = useState<CalibrationTone>('dark')
  const [neutralDiagnostic, setNeutralDiagnostic] = useState(false)
  const [diagnostics, setDiagnostics] = useState<FluidGlassTelemetry | null>(null)
  const textureUrl = useMemo(() => createControlledTextureUrl(tone), [tone])
  const calibratedTransmissionMaterial = useMemo(
    () =>
      neutralDiagnostic
        ? {
            ...transmissionMaterial,
            ior: 1.16,
            thickness: 0.32,
            roughness: 0,
            anisotropy: 0,
            chromaticAberration: 0,
            distortion: 0,
            distortionScale: 0,
            temporalDistortion: 0,
            attenuationDistance: 1_000_000,
            attenuationColor: '#ffffff',
          }
        : transmissionMaterial,
    [neutralDiagnostic, transmissionMaterial],
  )
  if (!textureUrl) return null

  const pane = (
    backend: CalibrationBackend,
    label: string,
    paneDebugView: FluidGlassDebugView = debugView,
  ) => (
    <div className="grid min-w-0 gap-2">
      <CalibrationPaneLabel backend={backend}>{label}</CalibrationPaneLabel>
      <CalibrationPane
        backend={backend}
        debugView={backend === 'transmission' ? paneDebugView : 'final'}
        lightDirection={lightDirection}
        material={material}
        onTelemetry={backend === 'transmission' ? setDiagnostics : undefined}
        showBounds={showInteractionDiagnostics}
        telemetry={diagnostics}
        textureUrl={textureUrl}
        transmissionMaterial={calibratedTransmissionMaterial}
      />
    </div>
  )

  const baseline = pane('baseline', 'DOM baseline · no canvas')
  const rawFramebuffer = pane('transmission', 'Raw FBO · no transmission', 'fbo-raw')
  const framebufferOverlay = pane('transmission', 'FBO 1:1 overlay · 50% over DOM', 'fbo-overlay')
  const framebufferDifference = pane(
    'transmission',
    'Pixel difference · source vs FBO ×12',
    'fbo-difference',
  )
  const transmission = pane('transmission', 'Transmission result')

  let comparison = transmission
  if (mode === 'baseline') comparison = baseline
  else if (mode === 'raw-fbo') comparison = rawFramebuffer
  else if (mode === 'fbo-overlay') comparison = framebufferOverlay
  else if (mode === 'fbo-difference') comparison = framebufferDifference

  return (
    <div className="grid gap-3" data-fluid-glass-calibration>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-border bg-background p-0.5">
          {(['dark', 'light'] as const).map((nextTone) => (
            <button
              key={nextTone}
              type="button"
              aria-pressed={tone === nextTone}
              onClick={() => setTone(nextTone)}
              className={cn(
                'h-7 rounded-md px-2.5 text-xs font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                tone === nextTone
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {nextTone} field
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={neutralDiagnostic}
          onClick={() => setNeutralDiagnostic((current) => !current)}
          className={cn(
            'h-8 rounded-lg border border-border px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            neutralDiagnostic
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          Neutral diagnostic
        </button>
      </div>
      {diagnostics && mode !== 'baseline' ? (
        <div className="grid gap-x-5 gap-y-1 rounded-xl border border-border/70 bg-background/60 p-3 font-mono text-[0.62rem] text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <span>
            CSS group {diagnostics.cameraWorldWidth.toFixed(0)}×
            {diagnostics.cameraWorldHeight.toFixed(0)}
          </span>
          <span>
            buffer {diagnostics.canvasBufferWidth.toFixed(0)}×
            {diagnostics.canvasBufferHeight.toFixed(0)}
          </span>
          <span>
            FBO {diagnostics.fboWidth.toFixed(0)}×{diagnostics.fboHeight.toFixed(0)}
          </span>
          <span>
            DPR {diagnostics.dpr.toFixed(2)} · scale {diagnostics.framebufferScaleX.toFixed(2)}×
            {diagnostics.framebufferScaleY.toFixed(2)}
          </span>
          <span>
            camera L{diagnostics.cameraLeft.toFixed(0)} R{diagnostics.cameraRight.toFixed(0)} T
            {diagnostics.cameraTop.toFixed(0)} B{diagnostics.cameraBottom.toFixed(0)}
          </span>
          <span>
            DOM ({diagnostics.targetDomX.toFixed(1)}, {diagnostics.targetDomY.toFixed(1)}){' '}
            {diagnostics.targetCssWidth.toFixed(1)}×{diagnostics.targetCssHeight.toFixed(1)}
          </span>
          <span>
            mesh ({diagnostics.meshScreenX.toFixed(1)}, {diagnostics.meshScreenY.toFixed(1)}){' '}
            {diagnostics.meshScreenWidth.toFixed(1)}×{diagnostics.meshScreenHeight.toFixed(1)}
          </span>
          <span>
            projected ({diagnostics.projectedMeshX.toFixed(1)},{' '}
            {diagnostics.projectedMeshY.toFixed(1)}) {diagnostics.projectedMeshWidth.toFixed(1)}×
            {diagnostics.projectedMeshHeight.toFixed(1)}
          </span>
          <span>
            Δ rect {diagnostics.projectedDeltaX.toFixed(2)},{' '}
            {diagnostics.projectedDeltaY.toFixed(2)} · {diagnostics.projectedDeltaWidth.toFixed(2)}×
            {diagnostics.projectedDeltaHeight.toFixed(2)}
          </span>
          <span>
            depth {diagnostics.meshWorldDepth.toFixed(1)} wu · ray{' '}
            {diagnostics.materialThicknessWorld.toFixed(1)} wu
          </span>
          <span>
            {diagnostics.outputColorSpace} · tone {diagnostics.toneMappingMode} · exposure{' '}
            {diagnostics.exposure.toFixed(2)}
          </span>
          <span>
            luminance bg {diagnostics.backgroundLuminance.toFixed(3)} · transmitted{' '}
            {diagnostics.transmittedLuminance.toFixed(3)} · ratio{' '}
            {diagnostics.transmittedLuminanceRatio.toFixed(3)}×
          </span>
          <span className="sm:col-span-2 xl:col-span-4">
            displacement{' '}
            {diagnostics.transmissionDisplacement
              .map(
                (sample) =>
                  `${sample.position} ${sample.horizontal.toFixed(2)}/${sample.vertical.toFixed(2)}/${sample.diagonal.toFixed(2)}px`,
              )
              .join(' · ')}
          </span>
          <span className="sm:col-span-2 xl:col-span-4">
            front normals 0–2° {(diagnostics.frontNormalHistogram.zeroToTwo * 100).toFixed(0)}% ·
            2–5° {(diagnostics.frontNormalHistogram.twoToFive * 100).toFixed(0)}% · 5–10°{' '}
            {(diagnostics.frontNormalHistogram.fiveToTen * 100).toFixed(0)}% · 10–20°{' '}
            {(diagnostics.frontNormalHistogram.tenToTwenty * 100).toFixed(0)}% · 20°+{' '}
            {(diagnostics.frontNormalHistogram.twentyPlus * 100).toFixed(0)}%
          </span>
        </div>
      ) : null}
      {comparison}
    </div>
  )
}
