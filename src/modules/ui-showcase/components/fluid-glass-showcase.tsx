import { CircleDot, Grip, Layers3, Radio, RefreshCw, Sparkles } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { FluidGlassCalibration, type FluidGlassCalibrationMode } from './fluid-glass-calibration'
import { FluidGlassTabComparison } from './fluid-glass-tab-comparison'
import {
  FluidGlassGroup,
  FluidGlassTarget,
  FluidGlassTransitionDebug,
  type FluidGlassBackend,
  type FluidGlassDebugView,
  type FluidGlassInteractionDiagnostics,
  type FluidGlassMaterial,
  type FluidGlassQuality,
  type FluidGlassRendererSelection,
  type FluidGlassTelemetry,
  type FluidTransmissionMaterial,
} from '@/components/fluid-glass'
import {
  FLUID_GLASS_MATERIAL_PRESETS,
  FLUID_TRANSMISSION_MATERIAL_PRESETS,
} from '@/components/fluid-glass/constants'
import { cn } from '@/shared/lib/utils'

const verticalTargets = [
  { id: 'broadcast', label: 'Broadcasts', icon: Radio },
  { id: 'library', label: 'Media library', icon: Layers3 },
  { id: 'signals', label: 'Live signals', icon: CircleDot },
] as const

const horizontalTargets = ['Overview', 'Scene library', 'People'] as const
const targetFocus =
  'outline-none focus-visible:ring-2 focus-visible:ring-foreground/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

type MaterialControlGroup = 'Geometry' | 'Transmission' | 'Dispersion' | 'Lighting'

const materialControlGroups: ReadonlyArray<MaterialControlGroup> = [
  'Geometry',
  'Transmission',
  'Dispersion',
  'Lighting',
]

const materialControls: ReadonlyArray<{
  group: MaterialControlGroup
  key: keyof FluidGlassMaterial
  label: string
  min: number
  max: number
  step: number
  unit: string
}> = [
  {
    group: 'Transmission',
    key: 'ior',
    label: 'Index of refraction',
    min: 1.02,
    max: 1.3,
    step: 0.005,
    unit: '',
  },
  {
    group: 'Dispersion',
    key: 'dispersionIor',
    label: 'Wavelength IOR spread',
    min: 0,
    max: 0.025,
    step: 0.0005,
    unit: '',
  },
  {
    group: 'Geometry',
    key: 'physicalThickness',
    label: 'Physical thickness',
    min: 0.08,
    max: 0.42,
    step: 0.01,
    unit: '× short side',
  },
  {
    group: 'Geometry',
    key: 'edgeWidthRatio',
    label: 'Optical edge width',
    min: 0.08,
    max: 0.22,
    step: 0.005,
    unit: '× short side',
  },
  {
    group: 'Geometry',
    key: 'rimWidthRatio',
    label: 'Rim width',
    min: 0.015,
    max: 0.08,
    step: 0.0025,
    unit: '×',
  },
  {
    group: 'Geometry',
    key: 'internalReflectionWidthRatio',
    label: 'Internal reflection width',
    min: 0.025,
    max: 0.12,
    step: 0.005,
    unit: '×',
  },
  {
    group: 'Geometry',
    key: 'shadowWidthRatio',
    label: 'Shadow width',
    min: 0.12,
    max: 0.4,
    step: 0.01,
    unit: '×',
  },
  {
    group: 'Geometry',
    key: 'surfaceCurvature',
    label: 'Surface curvature',
    min: 0.3,
    max: 1.8,
    step: 0.02,
    unit: '',
  },
  {
    group: 'Geometry',
    key: 'viewDepth',
    label: 'View depth',
    min: 0.5,
    max: 1.8,
    step: 0.05,
    unit: '',
  },
  {
    group: 'Geometry',
    key: 'bulge',
    label: 'Broad body bulge',
    min: 0,
    max: 0.7,
    step: 0.01,
    unit: '',
  },
  {
    group: 'Transmission',
    key: 'scattering',
    label: 'Scattering',
    min: 0,
    max: 3,
    step: 0.05,
    unit: 'px',
  },
  {
    group: 'Dispersion',
    key: 'dispersionPx',
    label: 'Artistic dispersion',
    min: 0,
    max: 5,
    step: 0.05,
    unit: 'fb px',
  },
  {
    group: 'Transmission',
    key: 'tintOpacity',
    label: 'Tint opacity',
    min: 0,
    max: 0.1,
    step: 0.0025,
    unit: '',
  },
  {
    group: 'Lighting',
    key: 'rimIntensity',
    label: 'Rim intensity',
    min: 0,
    max: 0.8,
    step: 0.02,
    unit: '',
  },
  {
    group: 'Lighting',
    key: 'internalReflection',
    label: 'Internal reflection',
    min: 0,
    max: 0.7,
    step: 0.02,
    unit: '',
  },
  {
    group: 'Lighting',
    key: 'shadowStrength',
    label: 'Shadow strength',
    min: 0,
    max: 0.8,
    step: 0.02,
    unit: '',
  },
]

const transmissionControls: ReadonlyArray<{
  key: Exclude<keyof FluidTransmissionMaterial, 'attenuationColor'>
  label: string
  min: number
  max: number
  step: number
}> = [
  { key: 'ior', label: 'IOR', min: 1.02, max: 1.3, step: 0.005 },
  { key: 'thickness', label: 'Thickness', min: 0.12, max: 1.2, step: 0.01 },
  { key: 'roughness', label: 'Roughness', min: 0, max: 0.4, step: 0.005 },
  { key: 'anisotropy', label: 'Anisotropy', min: 0, max: 0.4, step: 0.005 },
  {
    key: 'chromaticAberration',
    label: 'Chromatic aberration',
    min: 0,
    max: 0.35,
    step: 0.005,
  },
  { key: 'distortion', label: 'Distortion', min: 0, max: 0.6, step: 0.01 },
  { key: 'distortionScale', label: 'Distortion scale', min: 0, max: 1, step: 0.01 },
  {
    key: 'temporalDistortion',
    label: 'Temporal distortion',
    min: 0,
    max: 0.2,
    step: 0.005,
  },
  {
    key: 'attenuationDistance',
    label: 'Attenuation distance',
    min: 1_000,
    max: 1_000_000,
    step: 1_000,
  },
]

const debugViews: ReadonlyArray<{ value: FluidGlassDebugView; label: string }> = [
  { value: 'wireframe', label: 'Transmission wireframe' },
  { value: 'side-profile', label: 'Transmission side profile' },
  { value: 'depth-heatmap', label: 'Front depth heatmap' },
  { value: 'transmission-only', label: 'Transmission only' },
  { value: 'transmission-reflection', label: 'Transmission + reflection' },
  { value: 'transmission-shadow', label: 'Transmission + shadow' },
  { value: 'transmission-red', label: 'Red transmitted sample' },
  { value: 'transmission-green', label: 'Green transmitted sample' },
  { value: 'transmission-blue', label: 'Blue transmitted sample' },
  { value: 'curvature-weight', label: 'Curvature weight' },
  { value: 'dispersion-contribution', label: 'Dispersion contribution' },
  { value: 'final-dispersion', label: 'Final dispersion' },
  { value: 'mask', label: 'Show lens mask' },
  { value: 'normals', label: 'Show surface normals' },
  { value: 'refracted', label: 'Show refracted sample' },
  { value: 'dispersion', label: 'Show dispersion only' },
  { value: 'final-no-lighting', label: 'Final without lighting' },
  { value: 'final-no-scattering', label: 'Final without scattering' },
  { value: 'final-no-tint', label: 'Final without tint' },
  { value: 'final-no-rim', label: 'Final without rim' },
  { value: 'final', label: 'Final complete' },
]

const emptyTelemetry: FluidGlassTelemetry = {
  canvasBufferWidth: 0,
  canvasBufferHeight: 0,
  fboWidth: 0,
  fboHeight: 0,
  dpr: 1,
  framebufferScaleX: 1,
  framebufferScaleY: 1,
  cameraLeft: 0,
  cameraRight: 0,
  cameraTop: 0,
  cameraBottom: 0,
  targetDomX: 0,
  targetDomY: 0,
  targetCssWidth: 0,
  targetCssHeight: 0,
  meshScreenX: 0,
  meshScreenY: 0,
  meshScreenWidth: 0,
  meshScreenHeight: 0,
  projectedMeshX: 0,
  projectedMeshY: 0,
  projectedMeshWidth: 0,
  projectedMeshHeight: 0,
  projectedDeltaX: 0,
  projectedDeltaY: 0,
  projectedDeltaWidth: 0,
  projectedDeltaHeight: 0,
  cameraWorldWidth: 0,
  cameraWorldHeight: 0,
  meshWorldWidth: 0,
  meshWorldHeight: 0,
  meshWorldDepth: 0,
  materialThicknessWorld: 0,
  attenuationDistanceWorld: 0,
  outputColorSpace: 'srgb',
  toneMappingMode: 'none',
  rawVelocityX: 0,
  rawVelocityY: 0,
  rawVelocityMagnitude: 0,
  smoothedVelocityX: 0,
  smoothedVelocityY: 0,
  smoothedVelocityMagnitude: 0,
  normalizedVelocity: 0,
  clampedVelocityX: 0,
  clampedVelocityY: 0,
  clampedVelocityMagnitude: 0,
  velocityX: 0,
  velocityY: 0,
  velocityMagnitude: 0,
  interactionEnergy: 0.18,
  scaleX: 1,
  scaleY: 1,
  deformationDirection: 0,
  skewDegrees: 0,
  currentRefraction: 0,
  currentDispersion: 0,
  sampledLuminance: 0,
  brightAdaptation: 0,
  darkAdaptation: 0,
  exposure: 1,
  rimPolarity: 0,
  adaptedShadow: 0,
  dispersionAfterScattering: 0,
  dispersionAfterExposure: 0,
  dispersionAfterTint: 0,
  dispersionAfterFresnel: 0,
  dispersionAfterInternalReflection: 0,
  dispersionAfterRim: 0,
  dispersionAfterToneMapping: 0,
  finalDispersionSurvival: 0,
  backgroundLuminance: 0,
  transmittedLuminance: 0,
  transmittedLuminanceRatio: 1,
  transmissionDisplacement: [],
  frontNormalHistogram: {
    zeroToTwo: 0,
    twoToFive: 0,
    fiveToTen: 0,
    tenToTwenty: 0,
    twentyPlus: 0,
  },
}

const emptyInteractionDiagnostics: FluidGlassInteractionDiagnostics = {
  pointerOverCount: 0,
  pointerOutCount: 0,
  pointerMoveCount: 0,
  lastPointerTargetId: null,
}

function BackendBadge({ backend }: { backend: FluidGlassBackend }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold',
        backend === 'transmission'
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : backend === 'sdf'
            ? 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300'
            : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {backend === 'transmission' ? 'Transmission' : backend === 'sdf' ? 'SDF' : 'CSS'}
    </span>
  )
}

function ToneScenario({
  lightDirection,
  material,
  transmissionMaterial,
}: {
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  transmissionMaterial: FluidTransmissionMaterial
}) {
  const [active, setActive] = useState('capsule')
  const [tone, setTone] = useState<'light' | 'dark'>('light')
  const [adaptation, setAdaptation] = useState<FluidGlassTelemetry>(emptyTelemetry)
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const [sdfActive, setSdfActive] = useState('capsule')
  const [sdfBackend, setSdfBackend] = useState<FluidGlassBackend>('css')
  const [sdfDarkActive, setSdfDarkActive] = useState('capsule')
  const [sdfDarkBackend, setSdfDarkBackend] = useState<FluidGlassBackend>('css')

  return (
    <div className="grid gap-3">
      <FluidGlassGroup
        activation="always"
        environment={{ type: 'theme', pattern: 'grid', tone }}
        quality="high"
        materialPreset="expressive"
        renderer="transmission-experimental"
        material={material}
        transmissionMaterial={transmissionMaterial}
        lightDirection={lightDirection}
        onTelemetry={setAdaptation}
        onBackendChange={setBackend}
        className="fluid-glass-lab min-h-40 rounded-2xl border border-white/10"
        contentClassName="relative flex min-h-40 items-center justify-center gap-3 p-5"
      >
        <div className="absolute left-3 top-3">
          <BackendBadge backend={backend} />
        </div>
        <div
          aria-label={`${tone} field adaptation`}
          className={cn(
            'absolute bottom-3 left-3 flex flex-wrap gap-2 font-mono text-[0.6rem] tabular-nums',
            tone === 'dark' ? 'text-white/55' : 'text-slate-700',
          )}
        >
          <span>BG {adaptation.backgroundLuminance.toFixed(3)}</span>
          <span>TX {adaptation.transmittedLuminance.toFixed(3)}</span>
          <span>R {adaptation.transmittedLuminanceRatio.toFixed(3)}×</span>
        </div>
        <div className="absolute right-3 top-3 flex rounded-lg border border-current/15 bg-background/20 p-0.5 text-xs">
          {(['light', 'dark'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={tone === value}
              onClick={() => setTone(value)}
              className={cn(
                'rounded-md px-2 py-1 font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tone === value ? 'bg-foreground text-background' : 'text-current opacity-65',
              )}
            >
              {value} field
            </button>
          ))}
        </div>
        <FluidGlassTarget
          id={`${tone}-circle`}
          scopeId={`${tone}-field`}
          shape="circle"
          active={active === 'circle'}
          asChild
        >
          <button
            type="button"
            onClick={() => setActive('circle')}
            aria-pressed={active === 'circle'}
            className={cn(
              'grid size-14 place-items-center rounded-full text-sm',
              targetFocus,
              tone === 'dark' ? 'text-white' : 'text-slate-900',
            )}
          >
            <Sparkles className="size-5" />
          </button>
        </FluidGlassTarget>
        <FluidGlassTarget
          id={`${tone}-capsule`}
          scopeId={`${tone}-field`}
          shape="capsule"
          active={active === 'capsule'}
          asChild
        >
          <button
            type="button"
            onClick={() => setActive('capsule')}
            aria-pressed={active === 'capsule'}
            className={cn(
              'h-12 rounded-full px-5 text-sm font-semibold',
              targetFocus,
              tone === 'dark' ? 'text-white' : 'text-slate-900',
            )}
          >
            {tone === 'dark' ? 'Dark field' : 'Light field'}
          </button>
        </FluidGlassTarget>
      </FluidGlassGroup>
      <div data-fluid-glass-validation="light-field-sdf">
        <FluidGlassGroup
          activation="always"
          environment={{ type: 'theme', pattern: 'grid', tone: 'light' }}
          quality="high"
          materialPreset="expressive"
          debugView="final"
          renderer="auto"
          material={material}
          transmissionMaterial={transmissionMaterial}
          lightDirection={lightDirection}
          onBackendChange={setSdfBackend}
          className="fluid-glass-lab min-h-40 rounded-2xl border border-white/10"
          contentClassName="relative flex min-h-40 items-center justify-center gap-3 p-5"
        >
          <div className="absolute left-3 top-3">
            <BackendBadge backend={sdfBackend} />
          </div>
          <FluidGlassTarget
            id="sdf-light-circle"
            scopeId="sdf-light-field"
            shape="circle"
            active={sdfActive === 'circle'}
            asChild
          >
            <button
              type="button"
              onClick={() => setSdfActive('circle')}
              aria-pressed={sdfActive === 'circle'}
              className={cn(
                'grid size-14 place-items-center rounded-full text-sm',
                targetFocus,
                'text-slate-900',
              )}
            >
              <Sparkles className="size-5" />
            </button>
          </FluidGlassTarget>
          <FluidGlassTarget
            id="sdf-light-capsule"
            scopeId="sdf-light-field"
            shape="capsule"
            active={sdfActive === 'capsule'}
            asChild
          >
            <button
              type="button"
              onClick={() => setSdfActive('capsule')}
              aria-pressed={sdfActive === 'capsule'}
              className={cn(
                'h-12 rounded-full px-5 text-sm font-semibold',
                targetFocus,
                'text-slate-900',
              )}
            >
              Light field
            </button>
          </FluidGlassTarget>
        </FluidGlassGroup>
      </div>
      <div data-fluid-glass-validation="dark-field-sdf">
        <FluidGlassGroup
          activation="always"
          environment={{ type: 'theme', pattern: 'grid', tone: 'dark' }}
          quality="high"
          materialPreset="expressive"
          debugView="final"
          renderer="auto"
          material={material}
          transmissionMaterial={transmissionMaterial}
          lightDirection={lightDirection}
          onBackendChange={setSdfDarkBackend}
          className="fluid-glass-lab min-h-40 rounded-2xl border border-white/10"
          contentClassName="relative flex min-h-40 items-center justify-center gap-3 p-5"
        >
          <div className="absolute left-3 top-3">
            <BackendBadge backend={sdfDarkBackend} />
          </div>
          <FluidGlassTarget
            id="sdf-dark-circle"
            scopeId="sdf-dark-field"
            shape="circle"
            active={sdfDarkActive === 'circle'}
            asChild
          >
            <button
              type="button"
              onClick={() => setSdfDarkActive('circle')}
              aria-pressed={sdfDarkActive === 'circle'}
              className={cn(
                'grid size-14 place-items-center rounded-full text-sm',
                targetFocus,
                'text-white',
              )}
            >
              <Sparkles className="size-5" />
            </button>
          </FluidGlassTarget>
          <FluidGlassTarget
            id="sdf-dark-capsule"
            scopeId="sdf-dark-field"
            shape="capsule"
            active={sdfDarkActive === 'capsule'}
            asChild
          >
            <button
              type="button"
              onClick={() => setSdfDarkActive('capsule')}
              aria-pressed={sdfDarkActive === 'capsule'}
              className={cn(
                'h-12 rounded-full px-5 text-sm font-semibold',
                targetFocus,
                'text-white',
              )}
            >
              Dark field
            </button>
          </FluidGlassTarget>
        </FluidGlassGroup>
      </div>
    </div>
  )
}

function SizeStressTargets({
  activeId,
  onActivate,
}: {
  activeId: string
  onActivate: (id: string) => void
}) {
  const activate = (id: string) => () => onActivate(id)

  return (
    <div className="grid content-center gap-5 rounded-xl border border-foreground/10 bg-background/10 p-5 lg:col-span-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
          Size-relative material stress test
        </p>
        <p className="mt-1 text-xs text-foreground/55">
          One normalized profile; optical bands clamp per target short side.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <FluidGlassTarget
          id="stress-circle-32"
          scopeId="stress"
          shape="circle"
          active={activeId === 'circle-32'}
          asChild
        >
          <button
            type="button"
            aria-label="Activate 32 pixel circular lens"
            onClick={activate('circle-32')}
            className={cn(
              'grid size-8 place-items-center rounded-full text-foreground',
              targetFocus,
            )}
          >
            <Sparkles className="size-3.5" />
          </button>
        </FluidGlassTarget>
        <FluidGlassTarget
          id="stress-capsule-40"
          scopeId="stress"
          shape="capsule"
          active={activeId === 'capsule-40'}
          asChild
        >
          <button
            type="button"
            onClick={activate('capsule-40')}
            className={cn(
              'h-10 rounded-full px-4 text-sm font-medium text-foreground',
              targetFocus,
            )}
          >
            40px capsule
          </button>
        </FluidGlassTarget>
        <FluidGlassTarget
          id="stress-navigation-48"
          scopeId="stress"
          active={activeId === 'navigation-48'}
          asChild
        >
          <button
            type="button"
            onClick={activate('navigation-48')}
            className={cn(
              'flex h-12 min-w-48 items-center gap-2 rounded-xl px-4 text-sm font-medium text-foreground',
              targetFocus,
            )}
          >
            <Radio className="size-4" />
            48px navigation row
          </button>
        </FluidGlassTarget>
        <FluidGlassTarget
          id="stress-toolbar-72"
          scopeId="stress"
          active={activeId === 'toolbar-72'}
          asChild
        >
          <button
            type="button"
            onClick={activate('toolbar-72')}
            className={cn(
              'flex h-[4.5rem] items-center gap-2 rounded-2xl px-6 text-sm font-semibold text-foreground',
              targetFocus,
            )}
          >
            <Layers3 className="size-5" />
            72px toolbar
          </button>
        </FluidGlassTarget>
        <FluidGlassTarget
          id="stress-panel-large"
          scopeId="stress"
          active={activeId === 'panel-large'}
          radius={24}
          asChild
        >
          <button
            type="button"
            onClick={activate('panel-large')}
            className={cn(
              'flex h-28 min-w-64 items-end rounded-3xl p-5 text-left text-sm font-semibold text-foreground',
              targetFocus,
            )}
          >
            Large rounded panel
          </button>
        </FluidGlassTarget>
      </div>
    </div>
  )
}

export function FluidGlassShowcase() {
  const [activeVertical, setActiveVertical] = useState('broadcast')
  const [activeTab, setActiveTab] = useState<(typeof horizontalTargets)[number]>('Overview')
  const [activeExample, setActiveExample] = useState<'circle' | 'capsule' | 'wide'>('capsule')
  const [activeStress, setActiveStress] = useState('capsule-40')
  const [backend, setBackend] = useState<FluidGlassBackend>('css')
  const [quality, setQuality] = useState<FluidGlassQuality>('auto')
  const [forceFallback, setForceFallback] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [interactionDiagnostics, setInteractionDiagnostics] = useState(false)
  const [interactionCounts, setInteractionCounts] = useState<FluidGlassInteractionDiagnostics>(
    emptyInteractionDiagnostics,
  )
  const [tabRenderer, setTabRenderer] = useState<FluidGlassRendererSelection>('auto')
  const [preset, setPreset] = useState<'production' | 'expressive'>('expressive')
  const [material, setMaterial] = useState<FluidGlassMaterial>(() => ({
    ...FLUID_GLASS_MATERIAL_PRESETS.expressive,
  }))
  const [transmissionMaterial, setTransmissionMaterial] = useState<FluidTransmissionMaterial>(
    () => ({ ...FLUID_TRANSMISSION_MATERIAL_PRESETS.expressive }),
  )
  const [bodyRefractionContribution, setBodyRefractionContribution] = useState(1)
  const [calibrationMode, setCalibrationMode] = useState<FluidGlassCalibrationMode>('transmission')
  const [debugView, setDebugView] = useState<FluidGlassDebugView>('final')
  const [telemetry, setTelemetry] = useState<FluidGlassTelemetry>(emptyTelemetry)
  const [lightAngle, setLightAngle] = useState(136)
  const lightDirection = useMemo(() => {
    const radians = (lightAngle * Math.PI) / 180
    return [Math.cos(radians), Math.sin(radians)] as const
  }, [lightAngle])
  const calibratedMaterial = useMemo(
    () => ({
      ...material,
      physicalThickness: material.physicalThickness * bodyRefractionContribution,
      bulge: Math.min(0.8, material.bulge * (0.82 + bodyRefractionContribution * 0.18)),
    }),
    [bodyRefractionContribution, material],
  )

  const applyPreset = (nextPreset: 'production' | 'expressive') => {
    setPreset(nextPreset)
    setMaterial({ ...FLUID_GLASS_MATERIAL_PRESETS[nextPreset] })
    setTransmissionMaterial({ ...FLUID_TRANSMISSION_MATERIAL_PRESETS[nextPreset] })
    setBodyRefractionContribution(1)
  }

  const resetMaterial = () => {
    setMaterial({ ...FLUID_GLASS_MATERIAL_PRESETS[preset] })
    setTransmissionMaterial({ ...FLUID_TRANSMISSION_MATERIAL_PRESETS[preset] })
    setBodyRefractionContribution(1)
  }
  const updateTelemetry = useCallback((nextTelemetry: FluidGlassTelemetry) => {
    setTelemetry(nextTelemetry)
  }, [])
  const interactionTelemetry = [
    ['raw velocity X', telemetry.rawVelocityX, 'px/s'],
    ['raw velocity Y', telemetry.rawVelocityY, 'px/s'],
    ['raw magnitude', telemetry.rawVelocityMagnitude, 'px/s'],
    ['smoothed magnitude', telemetry.smoothedVelocityMagnitude, 'px/s'],
    ['normalized velocity', telemetry.normalizedVelocity, ''],
    ['clamped magnitude', telemetry.clampedVelocityMagnitude, 'px/s'],
    ['interaction energy', telemetry.interactionEnergy, ''],
    ['scaleX', telemetry.scaleX, '×'],
    ['scaleY', telemetry.scaleY, '×'],
    ['deformation direction', telemetry.deformationDirection, '°'],
    ['skew', telemetry.skewDegrees, '°'],
    ['current refraction', telemetry.currentRefraction, 'px'],
    ['current dispersion', telemetry.currentDispersion, 'fb px'],
  ] as const
  const adaptationTelemetry = [
    ['sampled luminance', telemetry.sampledLuminance],
    ['bright weight', telemetry.brightAdaptation],
    ['dark weight', telemetry.darkAdaptation],
    ['exposure', telemetry.exposure],
    ['rim polarity', telemetry.rimPolarity],
    ['adapted shadow', telemetry.adaptedShadow],
  ] as const
  const dispersionTelemetry = [
    ['dispersed refraction', 1],
    ['after scattering', telemetry.dispersionAfterScattering],
    ['after exposure', telemetry.dispersionAfterExposure],
    ['after tint', telemetry.dispersionAfterTint],
    ['after Fresnel', telemetry.dispersionAfterFresnel],
    ['after internal reflection', telemetry.dispersionAfterInternalReflection],
    ['after rim', telemetry.dispersionAfterRim],
    ['after tone mapping', telemetry.dispersionAfterToneMapping],
  ] as const

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_24px_80px_color-mix(in_srgb,var(--foreground)_10%,transparent)]">
      <header className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            Material lab
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Fluid glass, volumetric refraction
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            The lens replaces the controlled environment inside its mask. Labels and icons remain
            sharp DOM above the refracted grid.
          </p>
        </div>
        <BackendBadge backend={backend} />
      </header>

      <div className="border-b border-border/70 bg-muted/20 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Quality
            <select
              value={quality}
              onChange={(event) => setQuality(event.target.value as FluidGlassQuality)}
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="auto">Auto</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Material preset
            <select
              value={preset}
              onChange={(event) => applyPreset(event.target.value as 'production' | 'expressive')}
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="production">Production</option>
              <option value="expressive">Expressive</option>
            </select>
          </label>
          <label className="flex min-h-9 items-center gap-2 self-end rounded-lg border border-border bg-background px-3 text-sm">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(event) => setForceFallback(event.target.checked)}
            />
            Force CSS fallback
          </label>
          <label className="flex min-h-9 items-center gap-2 self-end rounded-lg border border-border bg-background px-3 text-sm">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            Reduced motion
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Interactive tab group
            <select
              value={tabRenderer}
              onChange={(event) =>
                setTabRenderer(event.target.value as FluidGlassRendererSelection)
              }
              className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="auto">SDF</option>
              <option value="transmission-experimental">Transmission experimental</option>
            </select>
          </label>
          <label className="flex min-h-9 items-center gap-2 self-end rounded-lg border border-border bg-background px-3 text-sm">
            <input
              type="checkbox"
              checked={interactionDiagnostics}
              onChange={(event) => setInteractionDiagnostics(event.target.checked)}
            />
            Interaction diagnostics
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
          <div>
            <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Calibration view
            </p>
            <div className="flex flex-wrap rounded-lg border border-border bg-background p-0.5">
              {(
                ['baseline', 'raw-fbo', 'fbo-overlay', 'transmission', 'fbo-difference'] as const
              ).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={calibrationMode === mode}
                  onClick={() => setCalibrationMode(mode)}
                  className={cn(
                    'h-8 rounded-md px-2.5 text-xs font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    calibrationMode === mode
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={resetMaterial}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <RefreshCw className="size-3.5" />
            Reset {preset}
          </button>
          <button
            type="button"
            aria-pressed={material.rimIntensity === 0 && material.tintOpacity === 0}
            onClick={() =>
              setMaterial((current) => {
                const proofEnabled = current.rimIntensity === 0 && current.tintOpacity === 0
                return {
                  ...current,
                  rimIntensity: proofEnabled
                    ? FLUID_GLASS_MATERIAL_PRESETS[preset].rimIntensity
                    : 0,
                  tintOpacity: proofEnabled ? FLUID_GLASS_MATERIAL_PRESETS[preset].tintOpacity : 0,
                }
              })
            }
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Zero rim + tint ·{' '}
            {material.rimIntensity === 0 && material.tintOpacity === 0 ? 'on' : 'off'}
          </button>
          <span className="text-xs text-muted-foreground">
            Calibration target is static. Use the press and drag controls below for interaction
            testing.
          </span>
        </div>

        <details className="mt-3 rounded-xl border border-border/70 bg-background/70">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50">
            Advanced material controls
          </summary>
          <div className="grid gap-3 border-t border-border/70 p-3 lg:grid-cols-2">
            {materialControlGroups.map((group) => (
              <fieldset
                key={group}
                className="grid gap-3 rounded-lg border border-border/70 p-3 sm:grid-cols-2"
              >
                <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {group}
                </legend>
                {materialControls
                  .filter((control) => control.group === group)
                  .map((control) => (
                    <label key={control.key} className="grid gap-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center justify-between gap-3">
                        {control.label}
                        <output className="font-mono text-[0.7rem] tabular-nums text-foreground">
                          {material[control.key].toFixed(control.step < 0.1 ? 3 : 1)}
                          {control.unit}
                        </output>
                      </span>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        value={material[control.key]}
                        onChange={(event) =>
                          setMaterial((current) => ({
                            ...current,
                            [control.key]: Number(event.target.value),
                          }))
                        }
                        className="h-2 accent-foreground"
                      />
                    </label>
                  ))}
                {group === 'Transmission' ? (
                  <label className="grid gap-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center justify-between gap-3">
                      Body refraction contribution
                      <output className="font-mono text-[0.7rem] tabular-nums text-foreground">
                        {bodyRefractionContribution.toFixed(2)}×
                      </output>
                    </span>
                    <input
                      type="range"
                      min="0.65"
                      max="1.35"
                      step="0.01"
                      value={bodyRefractionContribution}
                      onChange={(event) =>
                        setBodyRefractionContribution(Number(event.target.value))
                      }
                      className="h-2 accent-foreground"
                    />
                  </label>
                ) : null}
                {group === 'Lighting' ? (
                  <label className="grid gap-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center justify-between gap-3">
                      Light direction
                      <output className="font-mono text-[0.7rem] tabular-nums text-foreground">
                        {lightAngle}°
                      </output>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      step="1"
                      value={lightAngle}
                      onChange={(event) => setLightAngle(Number(event.target.value))}
                      className="h-2 accent-foreground"
                    />
                  </label>
                ) : null}
              </fieldset>
            ))}
          </div>
        </details>

        <details className="mt-3 rounded-xl border border-border/70 bg-background/70" open>
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50">
            Transmission material
          </summary>
          <div className="grid gap-3 border-t border-border/70 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {transmissionControls.map((control) => (
              <label key={control.key} className="grid gap-1.5 text-xs text-muted-foreground">
                <span className="flex items-center justify-between gap-3">
                  {control.label}
                  <output className="font-mono text-[0.7rem] tabular-nums text-foreground">
                    {transmissionMaterial[control.key].toFixed(control.step < 0.1 ? 3 : 1)}
                  </output>
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={transmissionMaterial[control.key]}
                  onChange={(event) =>
                    setTransmissionMaterial((current) => ({
                      ...current,
                      [control.key]: Number(event.target.value),
                    }))
                  }
                  className="h-2 accent-foreground"
                />
              </label>
            ))}
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center justify-between gap-3">
                Attenuation color
                <output className="font-mono text-[0.7rem] text-foreground">
                  {transmissionMaterial.attenuationColor}
                </output>
              </span>
              <input
                type="color"
                value={transmissionMaterial.attenuationColor}
                onChange={(event) =>
                  setTransmissionMaterial((current) => ({
                    ...current,
                    attenuationColor: event.target.value,
                  }))
                }
                className="h-8 w-full rounded border border-border bg-transparent"
              />
            </label>
          </div>
        </details>

        <details className="mt-3 rounded-xl border border-border/70 bg-background/70">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50">
            Interaction + debug telemetry
          </summary>
          <div
            data-fluid-glass-telemetry
            className="grid gap-4 border-t border-border/70 p-4 lg:grid-cols-2"
          >
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Interaction
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                {interactionTelemetry.map(([label, value, unit]) => (
                  <div key={label} className="min-w-0">
                    <dt className="truncate text-[0.65rem] text-muted-foreground">{label}</dt>
                    <dd className="font-mono text-xs tabular-nums text-foreground">
                      {value.toFixed(label.startsWith('scale') || label.includes('energy') ? 3 : 1)}
                      {unit}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Light-field adaptation
              </p>
              <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1">
                {adaptationTelemetry.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="truncate text-[0.65rem] text-muted-foreground">{label}</dt>
                    <dd className="font-mono text-xs tabular-nums text-foreground">
                      {value.toFixed(3)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Dispersion survival
                </p>
                <output className="font-mono text-xs font-semibold tabular-nums text-foreground">
                  {(telemetry.finalDispersionSurvival * 100).toFixed(0)}% final edge energy
                </output>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {dispersionTelemetry.map(([label, value]) => (
                  <div key={label}>
                    <div className="flex justify-between gap-2 text-[0.65rem] text-muted-foreground">
                      <span className="truncate">{label}</span>
                      <span className="font-mono tabular-nums">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${Math.min(100, value * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex flex-wrap items-center gap-1.5 lg:col-span-2"
              aria-label="Shader debug view"
            >
              {debugViews.map((view) => (
                <button
                  key={view.value}
                  type="button"
                  aria-pressed={debugView === view.value}
                  onClick={() => setDebugView(view.value)}
                  className={cn(
                    'h-8 rounded-lg border px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    debugView === view.value
                      ? 'border-foreground/30 bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                A/B transmission calibration
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Identical texture, lens footprint, DPR, IOR, thickness, dispersion, and light
                direction.
              </p>
            </div>
            <span className="hidden font-mono text-[0.65rem] text-muted-foreground sm:block">
              IOR {transmissionMaterial.ior.toFixed(3)} · thickness{' '}
              {transmissionMaterial.thickness.toFixed(3)}
            </span>
          </div>
          <FluidGlassCalibration
            mode={calibrationMode}
            debugView={debugView}
            material={calibratedMaterial}
            lightDirection={lightDirection}
            showInteractionDiagnostics={interactionDiagnostics}
            transmissionMaterial={transmissionMaterial}
          />
        </div>

        <div className="mb-4">
          <FluidGlassTabComparison
            lightDirection={lightDirection}
            material={calibratedMaterial}
            transmissionMaterial={transmissionMaterial}
          />
        </div>

        <div data-fluid-glass-validation="broadcasts-dark-sdf">
          <FluidGlassGroup
            activation="always"
            environment={{ type: 'theme', pattern: 'grid', tone: 'dark' }}
            quality={quality}
            forceFallback={forceFallback}
            simulateReducedMotion={reducedMotion}
            materialPreset={preset}
            material={calibratedMaterial}
            transmissionMaterial={transmissionMaterial}
            debugView={debugView}
            renderer={tabRenderer}
            lightDirection={lightDirection}
            onBackendChange={setBackend}
            onInteractionDiagnostics={interactionDiagnostics ? setInteractionCounts : undefined}
            onTelemetry={updateTelemetry}
            className="fluid-glass-lab min-h-[30rem] rounded-[1.4rem] border border-border/70"
            contentClassName="grid min-h-[30rem] gap-4 p-4 lg:grid-cols-[13rem_1fr] lg:p-6"
          >
            <div className="pointer-events-none absolute right-3 top-3 z-20">
              <BackendBadge backend={backend} />
            </div>
            <div className="rounded-xl border border-foreground/10 bg-background/10 p-2">
              <p className="px-2 pb-2 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/55">
                Workspace
              </p>
              <div className="grid gap-1">
                {verticalTargets.map((target) => {
                  const Icon = target.icon
                  const active = activeVertical === target.id
                  return (
                    <FluidGlassTarget
                      key={target.id}
                      id={`showcase-${target.id}`}
                      scopeId="sidebar"
                      active={active}
                      shape="rounded-rect"
                      radius="inherit"
                      asChild
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setActiveVertical(target.id)}
                        className={cn(
                          'flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-foreground',
                          targetFocus,
                        )}
                      >
                        <Icon className="size-4" />
                        {target.label}
                      </button>
                    </FluidGlassTarget>
                  )
                })}
              </div>
            </div>

            <div className="grid content-start gap-7 rounded-xl border border-foreground/10 bg-background/10 p-4 sm:p-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                  Selection capsule
                </p>
                <div
                  role="tablist"
                  aria-label="Fluid glass demo tabs"
                  className="flex flex-wrap gap-1"
                >
                  {horizontalTargets.map((tab) => {
                    const active = tab === activeTab
                    return (
                      <FluidGlassTarget
                        key={tab}
                        id={`showcase-tab-${tab}`}
                        scopeId="tabs"
                        active={active}
                        shape="capsule"
                        asChild
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            'h-10 rounded-full px-4 text-sm font-medium text-foreground',
                            targetFocus,
                          )}
                        >
                          {tab}
                        </button>
                      </FluidGlassTarget>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                  Drag deformation
                </p>
                <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-foreground/20">
                  <FluidGlassTarget
                    id="showcase-draggable"
                    scopeId="drag"
                    shape="rounded-rect"
                    radius="inherit"
                    active
                    behaviors={['hover', 'press', 'drag']}
                    draggable
                    dragBounds={72}
                    asChild
                  >
                    <button
                      type="button"
                      className={cn(
                        'flex h-16 touch-none cursor-grab items-center gap-3 rounded-xl px-5 text-sm font-semibold text-foreground active:cursor-grabbing',
                        targetFocus,
                      )}
                    >
                      <Grip className="size-5" />
                      Drag the lens
                    </button>
                  </FluidGlassTarget>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <FluidGlassTarget
                  id="showcase-circle"
                  scopeId="examples"
                  shape="circle"
                  active={activeExample === 'circle'}
                  asChild
                >
                  <button
                    type="button"
                    aria-label="Circular fluid glass icon button"
                    onClick={() => setActiveExample('circle')}
                    className={cn(
                      'grid size-12 place-items-center rounded-full text-foreground',
                      targetFocus,
                    )}
                  >
                    <Sparkles className="size-4" />
                  </button>
                </FluidGlassTarget>
                <FluidGlassTarget
                  id="showcase-capsule"
                  scopeId="examples"
                  shape="capsule"
                  active={activeExample === 'capsule'}
                  asChild
                >
                  <button
                    type="button"
                    onClick={() => setActiveExample('capsule')}
                    className={cn(
                      'h-12 rounded-full px-5 text-sm font-semibold text-foreground',
                      targetFocus,
                    )}
                  >
                    Press capsule
                  </button>
                </FluidGlassTarget>
                <FluidGlassTarget
                  id="showcase-wide"
                  scopeId="examples"
                  shape="rounded-rect"
                  radius={8}
                  active={activeExample === 'wide'}
                  asChild
                >
                  <button
                    type="button"
                    onClick={() => setActiveExample('wide')}
                    className={cn(
                      'h-12 rounded-lg px-7 text-sm font-semibold text-foreground',
                      targetFocus,
                    )}
                  >
                    Eight pixel radius
                  </button>
                </FluidGlassTarget>
              </div>
            </div>
            <SizeStressTargets activeId={activeStress} onActivate={setActiveStress} />
            {interactionDiagnostics ? (
              <>
                <FluidGlassTransitionDebug />
                <div className="pointer-events-none absolute bottom-3 right-3 z-30 grid gap-1 rounded-xl border border-white/10 bg-slate-950/90 p-3 font-mono text-[0.62rem] text-white/75 shadow-xl">
                  <span>pointerover {interactionCounts.pointerOverCount}</span>
                  <span>pointerout {interactionCounts.pointerOutCount}</span>
                  <span>pointermove {interactionCounts.pointerMoveCount}</span>
                  <span>last {interactionCounts.lastPointerTargetId ?? '—'}</span>
                </div>
              </>
            ) : null}
          </FluidGlassGroup>
        </div>

        <div className="mt-4">
          <ToneScenario
            material={calibratedMaterial}
            transmissionMaterial={transmissionMaterial}
            lightDirection={lightDirection}
          />
        </div>
      </div>
    </section>
  )
}
