import {
  NoToneMapping,
  type Camera,
  type Mesh,
  type Vector2,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three'

import { pixelLuminance } from './transmission-environment'
import {
  clamp,
  estimateTransmissionDisplacement,
  projectMeshBounds,
  rearDepthRatio,
  smoothstep,
  type VolumeDescriptor,
} from './transmission-geometry'
import type {
  FluidGlassLensSnapshot,
  FluidGlassTelemetry,
  FluidTransmissionMaterial,
} from '../types'

export function captureTransmissionTelemetry({
  backgroundPixel,
  camera,
  currentChromaticAberration,
  currentIor,
  currentThickness,
  descriptor,
  drawingBufferSize,
  frontNormalHistogram,
  gl,
  height,
  lens,
  luminanceSampleHeight,
  luminanceSampleWidth,
  material,
  mesh,
  renderTarget,
  size,
  speed,
  transmittedPixel,
  width,
}: {
  backgroundPixel: Uint8Array
  camera: Camera
  currentChromaticAberration: number
  currentIor: number
  currentThickness: number
  descriptor: VolumeDescriptor
  drawingBufferSize: Vector2
  frontNormalHistogram: FluidGlassTelemetry['frontNormalHistogram']
  gl: WebGLRenderer
  height: number
  lens: FluidGlassLensSnapshot
  luminanceSampleHeight: number
  luminanceSampleWidth: number
  material: FluidTransmissionMaterial
  mesh: Mesh
  renderTarget: WebGLRenderTarget
  size: { height: number; width: number }
  speed: number
  transmittedPixel: Uint8Array
  width: number
}): FluidGlassTelemetry {
  const rawVelocityMagnitude = Math.hypot(lens.rawVelocityX, lens.rawVelocityY)
  const smoothedVelocityMagnitude = Math.hypot(lens.smoothedVelocityX, lens.smoothedVelocityY)
  const clampedVelocityMagnitude = Math.hypot(lens.clampedVelocityX, lens.clampedVelocityY)
  const orthographicCamera = camera as Camera & {
    bottom: number
    left: number
    right: number
    top: number
  }
  gl.getDrawingBufferSize(drawingBufferSize)
  const sampleX = clamp(
    Math.floor(
      ((lens.x + lens.width * 0.5) / Math.max(1, size.width)) * renderTarget.width -
        luminanceSampleWidth * 0.5,
    ),
    0,
    Math.max(0, renderTarget.width - luminanceSampleWidth),
  )
  const sampleY = clamp(
    Math.floor(
      (1 - (lens.y + lens.height * 0.5) / Math.max(1, size.height)) * renderTarget.height,
    ) - Math.floor(luminanceSampleHeight * 0.5),
    0,
    Math.max(0, renderTarget.height - luminanceSampleHeight),
  )
  gl.readRenderTargetPixels(
    renderTarget,
    sampleX,
    sampleY,
    luminanceSampleWidth,
    luminanceSampleHeight,
    backgroundPixel,
  )
  const context = gl.getContext()
  context.readPixels(
    sampleX,
    sampleY,
    luminanceSampleWidth,
    luminanceSampleHeight,
    context.RGBA,
    context.UNSIGNED_BYTE,
    transmittedPixel,
  )
  const backgroundLuminance = pixelLuminance(backgroundPixel)
  const transmittedLuminance = pixelLuminance(transmittedPixel)
  const transmittedLuminanceRatio =
    backgroundLuminance > 0.001 ? transmittedLuminance / backgroundLuminance : 1
  const sampledLuminance = backgroundLuminance
  const projected = projectMeshBounds(mesh, camera, size.width, size.height)
  const meshScreenX = lens.x + (lens.width - width) / 2
  const meshScreenY = lens.y + (lens.height - height) / 2

  return {
    canvasBufferWidth: drawingBufferSize.x,
    canvasBufferHeight: drawingBufferSize.y,
    fboWidth: renderTarget.width,
    fboHeight: renderTarget.height,
    dpr: gl.getPixelRatio(),
    framebufferScaleX: drawingBufferSize.x / Math.max(1, size.width),
    framebufferScaleY: drawingBufferSize.y / Math.max(1, size.height),
    cameraLeft: orthographicCamera.left,
    cameraRight: orthographicCamera.right,
    cameraTop: orthographicCamera.top,
    cameraBottom: orthographicCamera.bottom,
    targetDomX: lens.x,
    targetDomY: lens.y,
    targetCssWidth: lens.width,
    targetCssHeight: lens.height,
    meshScreenX,
    meshScreenY,
    meshScreenWidth: width,
    meshScreenHeight: height,
    projectedMeshX: projected.x,
    projectedMeshY: projected.y,
    projectedMeshWidth: projected.width,
    projectedMeshHeight: projected.height,
    projectedDeltaX: projected.x - lens.x,
    projectedDeltaY: projected.y - lens.y,
    projectedDeltaWidth: projected.width - lens.width,
    projectedDeltaHeight: projected.height - lens.height,
    cameraWorldWidth: orthographicCamera.right - orthographicCamera.left,
    cameraWorldHeight: orthographicCamera.top - orthographicCamera.bottom,
    meshWorldWidth: width,
    meshWorldHeight: height,
    meshWorldDepth: (descriptor.depth + descriptor.depth * rearDepthRatio) * height,
    materialThicknessWorld: currentThickness * height,
    attenuationDistanceWorld: material.attenuationDistance,
    outputColorSpace: gl.outputColorSpace,
    toneMappingMode: gl.toneMapping === NoToneMapping ? 'none' : `${gl.toneMapping}`,
    rawVelocityX: lens.rawVelocityX,
    rawVelocityY: lens.rawVelocityY,
    rawVelocityMagnitude,
    smoothedVelocityX: lens.smoothedVelocityX,
    smoothedVelocityY: lens.smoothedVelocityY,
    smoothedVelocityMagnitude,
    normalizedVelocity: lens.normalizedVelocity,
    clampedVelocityX: lens.clampedVelocityX,
    clampedVelocityY: lens.clampedVelocityY,
    clampedVelocityMagnitude,
    velocityX: lens.velocityX,
    velocityY: lens.velocityY,
    velocityMagnitude: speed,
    interactionEnergy: lens.interactionEnergy,
    scaleX: lens.scaleX,
    scaleY: lens.scaleY,
    deformationDirection: Math.atan2(lens.velocityY, lens.velocityX) * (180 / Math.PI),
    skewDegrees: mesh.rotation.z * (180 / Math.PI),
    currentRefraction: currentThickness * height,
    currentDispersion: currentChromaticAberration,
    sampledLuminance,
    brightAdaptation: smoothstep(0.62, 0.9, sampledLuminance),
    darkAdaptation: 1 - smoothstep(0.08, 0.35, sampledLuminance),
    exposure: 1,
    rimPolarity: 0,
    adaptedShadow: 0,
    dispersionAfterScattering: 1,
    dispersionAfterExposure: 1,
    dispersionAfterTint: 1,
    dispersionAfterFresnel: 1,
    dispersionAfterInternalReflection: 1,
    dispersionAfterRim: 1,
    dispersionAfterToneMapping: 1,
    finalDispersionSurvival: 1,
    backgroundLuminance,
    transmittedLuminance,
    transmittedLuminanceRatio,
    transmissionDisplacement: estimateTransmissionDisplacement(
      currentIor,
      currentThickness,
      height,
    ),
    frontNormalHistogram,
  }
}
