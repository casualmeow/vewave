export {
  adaptEnvironmentSource,
  advanceReadability,
  describeBackdropSource,
  getSourceTraits,
  initialReadabilityFor,
  isCorsEligible,
} from './backdrop-source'
export type {
  LensBackdropSource,
  LensBackdropSourceKind,
  LensCrossOrigin,
  LensReadabilityEvent,
  LensSourceCategory,
  LensSourceDescriptor,
  LensSourceLifecycle,
  LensSourceReadability,
} from './backdrop-source'

export {
  probeCssBackdropFilterSupport,
  probeLensEnvironment,
  probeNativeSvgRefractionSupport,
  probeWebglSupport,
  resetCapabilityProbeCache,
  resolveLensCapabilities,
} from './capability'
export type {
  LensCapabilityInputs,
  LensCapabilityNote,
  LensCapabilitySnapshot,
  LensEnvironmentProbe,
} from './capability'

export { isWebglBackend, resolveLensBackend, toLegacyBackend } from './backend-resolution'
export type {
  LensBackend,
  LensBackendInput,
  LensBackendReason,
  LensBackendResolution,
  LensMaterialIntent,
  LensResolutionPrecedence,
} from './backend-resolution'

export {
  ACTIVE_LENS_GEOMETRY_POLICY,
  COUPLED_GEOMETRY_ENABLED,
  LensMotionOwnershipRegistry,
  resolveGeometryPolicy,
  targetGeometryIsAuthoritative,
} from './geometry-policy'
export type { LensGeometryPolicy, LensGeometryPolicyResolution } from './geometry-policy'

export { createLensStateAdapter, emptyLensStateSnapshot, readLensState } from './lens-state'
export type {
  LensGeometry,
  LensInteractionState,
  LensMotionIntent,
  LensStateAdapter,
  LensStateSnapshot,
} from './lens-state'

export {
  canTransition,
  forceContextLossForDebug,
  isRendererHealthy,
  LENS_RENDERER_TRANSITIONS,
  RendererLifecycleController,
} from './renderer-lifecycle'
export type {
  LensDisposalKind,
  LensDisposalReport,
  LensRendererLifecycleListener,
  LensRendererLifecycleState,
} from './renderer-lifecycle'

export {
  lensWebGlScopeGuard,
  PILOT_MAX_ACTIVE_WEBGL_SCOPES,
  WebGlScopePilotGuard,
} from './webgl-scope-guard'
export type { LensScopeAcquisition, LensScopeDenialReason } from './webgl-scope-guard'

export { ContextRecoveryController, DEFAULT_RECOVERY_ATTEMPTS } from './context-recovery'
export type {
  LensRecoveryPhase,
  LensRecoveryReason,
  LensRecoverySnapshot,
} from './context-recovery'

export { LensDebugChannel, toConsumerState } from './telemetry-contract'
export type {
  LensConsumerState,
  LensDebugEvent,
  LensDebugEventType,
  LensDebugSnapshot,
  LensVisualMode,
} from './telemetry-contract'
