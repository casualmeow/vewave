import type { ReactNode } from 'react'

export type FluidGlassShape = 'rounded-rect' | 'capsule' | 'circle'

export type FluidGlassBehavior = 'selection' | 'hover' | 'press' | 'drag' | 'static'

export type FluidGlassQuality = 'low' | 'medium' | 'high' | 'auto'

export type FluidGlassMaterialPreset = 'production' | 'expressive' | 'dragPeak'

export type FluidGlassDebugView =
  | 'final'
  | 'fbo-raw'
  | 'fbo-overlay'
  | 'fbo-difference'
  | 'bounds'
  | 'wireframe'
  | 'side-profile'
  | 'depth-heatmap'
  | 'transmission-only'
  | 'transmission-reflection'
  | 'transmission-shadow'
  | 'transmission-red'
  | 'transmission-green'
  | 'transmission-blue'
  | 'curvature-weight'
  | 'dispersion-contribution'
  | 'final-dispersion'
  | 'mask'
  | 'normals'
  | 'refracted'
  | 'dispersion'
  | 'final-no-lighting'
  | 'final-no-scattering'
  | 'final-no-tint'
  | 'final-no-rim'

export type FluidGlassMaterial = {
  edgeWidthRatio: number
  rimWidthRatio: number
  internalReflectionWidthRatio: number
  shadowWidthRatio: number
  minimumEdgeWidth: number
  maximumEdgeWidth: number
  ior: number
  dispersionIor: number
  physicalThickness: number
  surfaceCurvature: number
  viewDepth: number
  bulge: number
  roughness: number
  scattering: number
  dispersionPx: number
  rimIntensity: number
  internalReflection: number
  shadowStrength: number
  tintOpacity: number
}

export type FluidTransmissionMaterial = {
  ior: number
  thickness: number
  roughness: number
  anisotropy: number
  chromaticAberration: number
  distortion: number
  distortionScale: number
  temporalDistortion: number
  attenuationDistance: number
  attenuationColor: string
}

export type FluidGlassTelemetry = {
  canvasBufferWidth: number
  canvasBufferHeight: number
  fboWidth: number
  fboHeight: number
  dpr: number
  framebufferScaleX: number
  framebufferScaleY: number
  cameraLeft: number
  cameraRight: number
  cameraTop: number
  cameraBottom: number
  targetDomX: number
  targetDomY: number
  targetCssWidth: number
  targetCssHeight: number
  meshScreenX: number
  meshScreenY: number
  meshScreenWidth: number
  meshScreenHeight: number
  projectedMeshX: number
  projectedMeshY: number
  projectedMeshWidth: number
  projectedMeshHeight: number
  projectedDeltaX: number
  projectedDeltaY: number
  projectedDeltaWidth: number
  projectedDeltaHeight: number
  cameraWorldWidth: number
  cameraWorldHeight: number
  meshWorldWidth: number
  meshWorldHeight: number
  meshWorldDepth: number
  materialThicknessWorld: number
  attenuationDistanceWorld: number
  outputColorSpace: string
  toneMappingMode: string
  rawVelocityX: number
  rawVelocityY: number
  rawVelocityMagnitude: number
  smoothedVelocityX: number
  smoothedVelocityY: number
  smoothedVelocityMagnitude: number
  normalizedVelocity: number
  clampedVelocityX: number
  clampedVelocityY: number
  clampedVelocityMagnitude: number
  velocityX: number
  velocityY: number
  velocityMagnitude: number
  interactionEnergy: number
  scaleX: number
  scaleY: number
  deformationDirection: number
  skewDegrees: number
  currentRefraction: number
  currentDispersion: number
  sampledLuminance: number
  brightAdaptation: number
  darkAdaptation: number
  exposure: number
  rimPolarity: number
  adaptedShadow: number
  dispersionAfterScattering: number
  dispersionAfterExposure: number
  dispersionAfterTint: number
  dispersionAfterFresnel: number
  dispersionAfterInternalReflection: number
  dispersionAfterRim: number
  dispersionAfterToneMapping: number
  finalDispersionSurvival: number
  backgroundLuminance: number
  transmittedLuminance: number
  transmittedLuminanceRatio: number
  transmissionDisplacement: ReadonlyArray<{
    position: 'center' | '25%' | '50%' | '75%' | '90%' | 'edge'
    horizontal: number
    vertical: number
    diagonal: number
  }>
  frontNormalHistogram: {
    zeroToTwo: number
    twoToFive: number
    fiveToTen: number
    tenToTwenty: number
    twentyPlus: number
  }
}

export type FluidGlassSemanticEventType =
  | 'register'
  | 'unregister'
  | 'active-prop-change'
  | 'pointer-enter'
  | 'pointer-leave'
  | 'pointer-down'
  | 'pointer-up'
  | 'focus'
  | 'blur'
  | 'selection-change'
  | 'measurement-complete'
  | 'resolved-target-change'
  | 'desired-rect-change'

export type FluidGlassScopeId = string

export type FluidGlassTraceValue =
  | string
  | number
  | boolean
  | FluidGlassRect
  | Readonly<Record<FluidGlassScopeId, string>>
  | null

export type FluidGlassTransitionChangeKind =
  | 'membership-only'
  | 'scope-ownership'
  | 'resolved-target'
  | 'geometry-only'
  | 'semantic-only'

export type FluidGlassTransitionTraceEntry = {
  timestamp: number
  eventType: FluidGlassSemanticEventType
  sourceScopeId: FluidGlassScopeId | null
  sourceTargetId: string | null
  field:
    | 'event'
    | 'activeTargetByScope'
    | 'currentScopeId'
    | 'hoveredTargetId'
    | 'pressedTargetId'
    | 'draggedTargetId'
    | 'focusedTargetId'
    | 'resolvedTargetId'
    | 'desiredRect'
    | 'currentRect'
  previousValue: FluidGlassTraceValue
  nextValue: FluidGlassTraceValue
  reason: string
  changeKind: FluidGlassTransitionChangeKind
}

export type FluidGlassTransitionDebugSnapshot = {
  activeTargetByScope: Readonly<Record<FluidGlassScopeId, string>>
  currentScopeId: FluidGlassScopeId | null
  hoveredTargetId: string | null
  hoveredTargetScopeId: FluidGlassScopeId | null
  pressedTargetId: string | null
  pressedTargetScopeId: FluidGlassScopeId | null
  draggedTargetId: string | null
  draggedTargetScopeId: FluidGlassScopeId | null
  focusedTargetId: string | null
  focusedTargetScopeId: FluidGlassScopeId | null
  resolvedTargetId: string | null
  transitionGeneration: number
  desiredRect: FluidGlassRect | null
  resolvedRect: FluidGlassRect | null
  currentRect: FluidGlassRect | null
  lastSemanticEvent: FluidGlassTransitionTraceEntry | null
  lastScopeChangingEvent: FluidGlassTransitionTraceEntry | null
  lastTargetChangingEvent: FluidGlassTransitionTraceEntry | null
  timeline: ReadonlyArray<FluidGlassTransitionTraceEntry>
}

export type FluidGlassEnvironmentSource =
  | { type: 'theme'; pattern?: 'calm' | 'grid'; tone?: 'auto' | 'light' | 'dark' }
  | { type: 'image'; src: string }

export type FluidGlassBackend = 'css' | 'sdf' | 'transmission'

export type FluidGlassRendererSelection = 'auto' | 'transmission-experimental'

export type FluidGlassInteractionDiagnostics = {
  pointerOverCount: number
  pointerOutCount: number
  pointerMoveCount: number
  lastPointerTargetId: string | null
}

export type FluidGlassRadius = number | 'inherit'

export type FluidGlassGroupProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  environment?: FluidGlassEnvironmentSource
  quality?: FluidGlassQuality | 'disabled'
  renderer?: FluidGlassRendererSelection
  mode?: 'shared-lens'
  activation?: 'always' | 'appearance'
  forceFallback?: boolean
  simulateReducedMotion?: boolean
  material?: Partial<FluidGlassMaterial>
  materialPreset?: FluidGlassMaterialPreset
  transmissionMaterial?: Partial<FluidTransmissionMaterial>
  debugView?: FluidGlassDebugView
  lightDirection?: readonly [number, number]
  onBackendChange?: (backend: FluidGlassBackend) => void
  onInteractionDiagnostics?: (diagnostics: FluidGlassInteractionDiagnostics) => void
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
}

export type FluidGlassTargetProps = {
  id: string
  scopeId?: FluidGlassScopeId
  children: ReactNode
  asChild?: boolean
  active?: boolean
  disabled?: boolean
  shape?: FluidGlassShape
  radius?: FluidGlassRadius
  behaviors?: ReadonlyArray<FluidGlassBehavior>
  draggable?: boolean
  dragBounds?: number
  className?: string
}

export type FluidGlassRect = {
  x: number
  y: number
  width: number
  height: number
  radius: number
  shape: FluidGlassShape
}

export type FluidGlassLensSnapshot = FluidGlassRect & {
  opacity: number
  refraction: number
  highlight: number
  shadow: number
  scaleX: number
  scaleY: number
  velocityX: number
  velocityY: number
  rawVelocityX: number
  rawVelocityY: number
  smoothedVelocityX: number
  smoothedVelocityY: number
  normalizedVelocity: number
  clampedVelocityX: number
  clampedVelocityY: number
  interactionEnergy: number
}

export type FluidGlassTargetState = {
  id: string
  scopeId: FluidGlassScopeId
  element: HTMLElement
  rect: FluidGlassRect | null
  active: boolean
  behaviors: ReadonlyArray<FluidGlassBehavior>
  disabled: boolean
  hovered: boolean
  pressed: boolean
  dragged: boolean
  focused: boolean
  shape: FluidGlassShape
  radius: FluidGlassRadius
  pointerVelocityX: number
  pointerVelocityY: number
  rawPointerVelocityX: number
  rawPointerVelocityY: number
  smoothedPointerVelocityX: number
  smoothedPointerVelocityY: number
  normalizedPointerVelocity: number
  interactionOrder: number
  measurementGeneration: number
  layoutGeneration: number
}

export type FluidGlassTransitionCommand = {
  generation: number
  targetId: string | null
  rect: FluidGlassRect | null
  shape: FluidGlassShape
  radius: number
}
