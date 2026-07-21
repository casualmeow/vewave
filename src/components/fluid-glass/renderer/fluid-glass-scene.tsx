import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TextureLoader, Vector2, Vector4, type ShaderMaterial, type Texture } from 'three'

import { FLUID_GLASS_MATERIAL_PRESETS, resolveFluidGlassQuality } from '../constants'
import { fluidGlassFragmentShader } from '../shaders/fluid-glass.frag'
import { fluidGlassVertexShader } from '../shaders/fluid-glass.vert'
import type {
  FluidGlassDebugView,
  FluidGlassEnvironmentSource,
  FluidGlassMaterial,
  FluidGlassQuality,
  FluidGlassTelemetry,
} from '../types'
import type { FluidGlassStore } from './store'

const debugViewValues: Record<FluidGlassDebugView, number> = {
  final: 0,
  'fbo-raw': 0,
  'fbo-overlay': 0,
  'fbo-difference': 0,
  bounds: 0,
  wireframe: 0,
  'side-profile': 0,
  'depth-heatmap': 0,
  'transmission-only': 0,
  'transmission-reflection': 0,
  'transmission-shadow': 0,
  'transmission-red': 0,
  'transmission-green': 0,
  'transmission-blue': 0,
  'curvature-weight': 0,
  'dispersion-contribution': 0,
  'final-dispersion': 0,
  mask: 1,
  normals: 2,
  refracted: 3,
  dispersion: 4,
  'final-no-lighting': 5,
  'final-no-scattering': 6,
  'final-no-tint': 7,
  'final-no-rim': 8,
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
  return amount * amount * (3 - 2 * amount)
}

export function FluidGlassScene({
  environment,
  debugView,
  lightDirection,
  material,
  onFailure,
  onTelemetry,
  quality,
  store,
}: {
  environment: FluidGlassEnvironmentSource
  debugView: FluidGlassDebugView
  lightDirection: readonly [number, number]
  material: FluidGlassMaterial
  onFailure: () => void
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
  quality: FluidGlassQuality
  store: FluidGlassStore
}) {
  const materialRef = useRef<ShaderMaterial>(null)
  const invalidate = useThree((state) => state.invalidate)
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)
  const framebufferSize = useRef(new Vector2(1, 1))
  const lastTelemetryAt = useRef(0)
  const [texture, setTexture] = useState<Texture | null>(null)
  const resolvedQuality = resolveFluidGlassQuality(quality)
  const initialDark =
    environment.type === 'theme' && environment.tone !== 'auto'
      ? environment.tone === 'dark'
      : document.documentElement.dataset.resolvedMode === 'dark' ||
        document.documentElement.classList.contains('dark')

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new Vector2(1, 1) },
      uPixelSize: { value: new Vector2(1, 1) },
      uCssPixelSize: { value: new Vector2(1, 1) },
      uLens: { value: new Vector4(0, 0, 0, 0) },
      uRadius: { value: 0 },
      uOpacity: { value: 0 },
      uInteractionRefraction: { value: 0.72 },
      uInteractionHighlight: { value: 0.58 },
      uInteractionShadow: { value: 0.72 },
      uInteractionEnergy: { value: 0.18 },
      uVelocity: { value: new Vector2(0, 0) },
      uShape: { value: 0 },
      uSamples: { value: resolvedQuality.scatterSamples },
      uDark: { value: initialDark ? 1 : 0 },
      uPattern: { value: environment.type === 'theme' && environment.pattern === 'grid' ? 1 : 0 },
      uUseImage: { value: 0 },
      uEnvironment: { value: null as Texture | null },
      uEdgeWidthRatio: { value: material.edgeWidthRatio },
      uRimWidthRatio: { value: material.rimWidthRatio },
      uInternalReflectionWidthRatio: { value: material.internalReflectionWidthRatio },
      uShadowWidthRatio: { value: material.shadowWidthRatio },
      uMinimumEdgeWidth: { value: material.minimumEdgeWidth },
      uMaximumEdgeWidth: { value: material.maximumEdgeWidth },
      uIor: { value: material.ior },
      uDispersionIor: { value: material.dispersionIor },
      uPhysicalThickness: { value: material.physicalThickness },
      uSurfaceCurvature: { value: material.surfaceCurvature },
      uViewDepth: { value: material.viewDepth },
      uBulge: { value: material.bulge },
      uRoughness: { value: material.roughness },
      uScattering: { value: material.scattering },
      uDispersionPx: { value: material.dispersionPx },
      uRimIntensity: { value: material.rimIntensity },
      uInternalReflection: { value: material.internalReflection },
      uShadowStrength: { value: material.shadowStrength },
      uTintOpacity: { value: material.tintOpacity },
      uLightDirection: { value: new Vector2(lightDirection[0], lightDirection[1]) },
      uDebugView: { value: debugViewValues[debugView] },
    }),
    [debugView, environment, initialDark, lightDirection, material, resolvedQuality.scatterSamples],
  )

  useEffect(() => store.subscribe(invalidate), [invalidate, store])

  useEffect(() => {
    const canvas = gl.domElement
    const restoreMaterial = () => {
      if (materialRef.current) materialRef.current.needsUpdate = true
      invalidate()
      window.requestAnimationFrame(() => invalidate())
    }
    canvas.addEventListener('webglcontextrestored', restoreMaterial)
    return () => canvas.removeEventListener('webglcontextrestored', restoreMaterial)
  }, [gl, invalidate])

  useEffect(() => {
    if (environment.type !== 'image') {
      setTexture(null)
      return
    }

    let cancelled = false
    const loader = new TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      environment.src,
      (loaded) => {
        if (cancelled) {
          loaded.dispose()
          return
        }
        setTexture(loaded)
        invalidate()
      },
      undefined,
      () => {
        if (!cancelled) onFailure()
      },
    )

    return () => {
      cancelled = true
    }
  }, [environment, invalidate, onFailure])

  useEffect(() => {
    uniforms.uUseImage.value = texture ? 1 : 0
    uniforms.uEnvironment.value = texture
    if (materialRef.current) {
      materialRef.current.uniforms.uUseImage.value = texture ? 1 : 0
      materialRef.current.uniforms.uEnvironment.value = texture
    }
    invalidate()
  }, [invalidate, texture, uniforms])

  useEffect(() => () => texture?.dispose(), [texture])

  useEffect(() => {
    const root = document.documentElement
    const updateTheme = () => {
      const explicitTone = environment.type === 'theme' ? environment.tone : 'auto'
      const dark =
        explicitTone === 'dark' ||
        (explicitTone !== 'light' &&
          (root.dataset.resolvedMode === 'dark' || root.classList.contains('dark')))
          ? 1
          : 0
      const pattern = environment.type === 'theme' && environment.pattern === 'grid' ? 1 : 0
      uniforms.uDark.value = dark
      uniforms.uPattern.value = pattern
      if (materialRef.current) {
        materialRef.current.uniforms.uDark.value = dark
        materialRef.current.uniforms.uPattern.value = pattern
      }
      invalidate()
    }
    const observer = new MutationObserver(updateTheme)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-resolved-mode'] })
    updateTheme()
    return () => observer.disconnect()
  }, [environment, invalidate, uniforms])

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const materialUniforms = materialRef.current.uniforms
    const lens = store.current
    const width = lens.width * lens.scaleX
    const height = lens.height * lens.scaleY
    const drawingBufferSize = gl.getDrawingBufferSize(framebufferSize.current)
    const dragMix = Math.max(0, Math.min(1, (lens.interactionEnergy - 0.64) / 0.36))
    const dragPeak = FLUID_GLASS_MATERIAL_PRESETS.dragPeak
    const framebufferDpr = drawingBufferSize.x / Math.max(1, size.width)
    const minLensFramebufferPixels = Math.min(width, height) * framebufferDpr
    const maxDispersionPx = Math.max(0.6, Math.min(7, minLensFramebufferPixels * 0.1))

    materialUniforms.uResolution.value.set(size.width, size.height)
    materialUniforms.uPixelSize.value.set(1 / drawingBufferSize.x, 1 / drawingBufferSize.y)
    materialUniforms.uCssPixelSize.value.set(1 / size.width, 1 / size.height)
    materialUniforms.uLens.value.set(
      lens.x + lens.width / 2,
      size.height - (lens.y + lens.height / 2),
      width,
      height,
    )
    materialUniforms.uRadius.value = lens.radius
    materialUniforms.uOpacity.value = lens.opacity
    materialUniforms.uInteractionRefraction.value = lens.refraction
    materialUniforms.uInteractionHighlight.value = lens.highlight
    materialUniforms.uInteractionShadow.value = lens.shadow
    materialUniforms.uInteractionEnergy.value = lens.interactionEnergy
    materialUniforms.uVelocity.value.set(lens.velocityX, lens.velocityY)
    materialUniforms.uShape.value = lens.shape === 'circle' ? 2 : lens.shape === 'capsule' ? 1 : 0
    materialUniforms.uUseImage.value = texture ? 1 : 0
    materialUniforms.uEnvironment.value = texture
    materialUniforms.uEdgeWidthRatio.value = mix(
      material.edgeWidthRatio,
      dragPeak.edgeWidthRatio,
      dragMix,
    )
    materialUniforms.uRimWidthRatio.value = mix(
      material.rimWidthRatio,
      dragPeak.rimWidthRatio,
      dragMix,
    )
    materialUniforms.uInternalReflectionWidthRatio.value = mix(
      material.internalReflectionWidthRatio,
      dragPeak.internalReflectionWidthRatio,
      dragMix,
    )
    materialUniforms.uShadowWidthRatio.value = mix(
      material.shadowWidthRatio,
      dragPeak.shadowWidthRatio,
      dragMix,
    )
    materialUniforms.uMinimumEdgeWidth.value = mix(
      material.minimumEdgeWidth,
      dragPeak.minimumEdgeWidth,
      dragMix,
    )
    materialUniforms.uMaximumEdgeWidth.value = mix(
      material.maximumEdgeWidth,
      dragPeak.maximumEdgeWidth,
      dragMix,
    )
    materialUniforms.uIor.value = mix(material.ior, dragPeak.ior, dragMix)
    materialUniforms.uDispersionIor.value = mix(
      material.dispersionIor,
      dragPeak.dispersionIor,
      dragMix,
    )
    materialUniforms.uPhysicalThickness.value = mix(
      material.physicalThickness,
      dragPeak.physicalThickness,
      dragMix,
    )
    materialUniforms.uSurfaceCurvature.value = mix(
      material.surfaceCurvature,
      dragPeak.surfaceCurvature,
      dragMix,
    )
    materialUniforms.uViewDepth.value = mix(material.viewDepth, dragPeak.viewDepth, dragMix)
    materialUniforms.uBulge.value = mix(material.bulge, dragPeak.bulge, dragMix)
    materialUniforms.uRoughness.value = mix(material.roughness, dragPeak.roughness, dragMix)
    materialUniforms.uScattering.value = mix(material.scattering, dragPeak.scattering, dragMix)
    materialUniforms.uDispersionPx.value = Math.min(
      mix(material.dispersionPx, dragPeak.dispersionPx, dragMix),
      maxDispersionPx,
    )
    materialUniforms.uRimIntensity.value = mix(
      material.rimIntensity,
      dragPeak.rimIntensity,
      dragMix,
    )
    materialUniforms.uInternalReflection.value = mix(
      material.internalReflection,
      dragPeak.internalReflection,
      dragMix,
    )
    materialUniforms.uShadowStrength.value = mix(
      material.shadowStrength,
      dragPeak.shadowStrength,
      dragMix,
    )
    materialUniforms.uTintOpacity.value = mix(material.tintOpacity, dragPeak.tintOpacity, dragMix)
    materialUniforms.uLightDirection.value.set(lightDirection[0], lightDirection[1]).normalize()
    materialUniforms.uDebugView.value = debugViewValues[debugView]

    const elapsedMs = clock.elapsedTime * 1000
    if (onTelemetry && elapsedMs - lastTelemetryAt.current >= 80) {
      lastTelemetryAt.current = elapsedMs
      const velocityMagnitude = Math.hypot(lens.velocityX, lens.velocityY)
      const representativeLuminance =
        environment.type === 'theme'
          ? environment.tone === 'light'
            ? 0.9
            : environment.tone === 'dark'
              ? 0.075
              : materialUniforms.uDark.value > 0.5
                ? 0.075
                : 0.9
          : 0.5
      const brightAdaptation = smoothstep(0.62, 0.9, representativeLuminance)
      const darkAdaptation = 1 - smoothstep(0.08, 0.36, representativeLuminance)
      const currentIor = materialUniforms.uIor.value
      const currentRoughness = materialUniforms.uRoughness.value
      const currentTintOpacity = materialUniforms.uTintOpacity.value
      const currentInternalReflection = materialUniforms.uInternalReflection.value
      const currentRimIntensity = materialUniforms.uRimIntensity.value
      const thicknessPx = Math.min(width, height) * materialUniforms.uPhysicalThickness.value
      const opticalOffset =
        thicknessPx *
        (1 - 1 / currentIor) *
        materialUniforms.uSurfaceCurvature.value *
        (1 + materialUniforms.uViewDepth.value * 2.6) *
        0.42 *
        lens.refraction
      const currentDispersion = Math.min(
        maxDispersionPx,
        materialUniforms.uDispersionPx.value +
          thicknessPx * materialUniforms.uDispersionIor.value * lens.refraction,
      )
      const rawVelocityMagnitude = Math.hypot(lens.rawVelocityX, lens.rawVelocityY)
      const smoothedVelocityMagnitude = Math.hypot(lens.smoothedVelocityX, lens.smoothedVelocityY)
      const clampedVelocityMagnitude = Math.hypot(lens.clampedVelocityX, lens.clampedVelocityY)
      const spectralProtection = smoothstep(0.5, 2.4, materialUniforms.uDispersionPx.value)
      const dispersionAfterScattering = Math.max(
        0,
        1 - currentRoughness * (1 - spectralProtection * 0.42) + spectralProtection * 0.22,
      )
      const exposure = mix(0.92, 0.88, brightAdaptation)
      const dispersionAfterExposure = dispersionAfterScattering * exposure
      const dispersionAfterTint = dispersionAfterExposure * (1 - currentTintOpacity * 0.08)
      const f0 = ((currentIor - 1) / (currentIor + 1)) ** 2
      const representativeFresnel = f0 + (1 - f0) * (1 - 0.45) ** 5
      const dispersionAfterFresnel =
        dispersionAfterTint * (1 - representativeFresnel * currentInternalReflection * 0.38)
      const dispersionAfterInternalReflection =
        dispersionAfterFresnel * (1 - currentInternalReflection * 0.06)
      const dispersionAfterRim =
        dispersionAfterInternalReflection * (1 - currentRimIntensity * 0.025)
      const dispersionAfterToneMapping = dispersionAfterRim * mix(0.96, 0.9, brightAdaptation)
      onTelemetry({
        canvasBufferWidth: size.width,
        canvasBufferHeight: size.height,
        fboWidth: size.width,
        fboHeight: size.height,
        dpr: 1,
        framebufferScaleX: 1,
        framebufferScaleY: 1,
        cameraLeft: -1,
        cameraRight: 1,
        cameraTop: 1,
        cameraBottom: -1,
        targetDomX: lens.x,
        targetDomY: lens.y,
        targetCssWidth: lens.width,
        targetCssHeight: lens.height,
        meshScreenX: lens.x,
        meshScreenY: lens.y,
        meshScreenWidth: lens.width,
        meshScreenHeight: lens.height,
        projectedMeshX: lens.x,
        projectedMeshY: lens.y,
        projectedMeshWidth: lens.width,
        projectedMeshHeight: lens.height,
        projectedDeltaX: 0,
        projectedDeltaY: 0,
        projectedDeltaWidth: 0,
        projectedDeltaHeight: 0,
        cameraWorldWidth: size.width,
        cameraWorldHeight: size.height,
        meshWorldWidth: lens.width,
        meshWorldHeight: lens.height,
        meshWorldDepth: material.physicalThickness * lens.height,
        materialThicknessWorld: material.physicalThickness * lens.height,
        attenuationDistanceWorld: 0,
        outputColorSpace: 'srgb',
        toneMappingMode: 'none',
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
        velocityMagnitude,
        interactionEnergy: lens.interactionEnergy,
        scaleX: lens.scaleX,
        scaleY: lens.scaleY,
        deformationDirection:
          velocityMagnitude > 0.5
            ? (Math.atan2(lens.velocityY, lens.velocityX) * 180) / Math.PI
            : 0,
        skewDegrees: lens.normalizedVelocity * 2.6,
        currentRefraction: opticalOffset,
        currentDispersion,
        sampledLuminance: representativeLuminance,
        brightAdaptation,
        darkAdaptation,
        exposure,
        rimPolarity: brightAdaptation,
        adaptedShadow: materialUniforms.uShadowStrength.value * mix(1, 1.22, brightAdaptation),
        dispersionAfterScattering,
        dispersionAfterExposure,
        dispersionAfterTint,
        dispersionAfterFresnel,
        dispersionAfterInternalReflection,
        dispersionAfterRim,
        dispersionAfterToneMapping,
        finalDispersionSurvival: Math.min(1, dispersionAfterToneMapping / 2.2),
        backgroundLuminance: representativeLuminance,
        transmittedLuminance: representativeLuminance * exposure,
        transmittedLuminanceRatio: exposure,
        transmissionDisplacement: [],
        frontNormalHistogram: {
          zeroToTwo: 0,
          twoToFive: 0,
          fiveToTen: 0,
          tenToTwenty: 0,
          twentyPlus: 0,
        },
      })
    }
  })

  useEffect(
    () => invalidate(),
    [debugView, invalidate, lightDirection, material, size.height, size.width, texture],
  )

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={fluidGlassVertexShader}
        fragmentShader={fluidGlassFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        transparent={false}
      />
    </mesh>
  )
}
