import { MeshTransmissionMaterial, useFBO } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DoubleSide, Scene, UnsignedByteType, Vector2, type Mesh } from 'three'

import { FLUID_TRANSMISSION_MATERIAL_PRESETS, resolveFluidGlassQuality } from '../constants'
import {
  FramebufferDiagnostic,
  TransmissionEnvironment,
  createReflectionTexture,
  updateRenderTargetColorSpace,
  useEnvironmentTexture,
} from './transmission-environment'
import { useFluidGlassTheme } from './fluid-glass-theme'
import {
  clamp,
  createVolumeGeometry,
  getVolumeDescriptor,
  measureFrontNormalHistogram,
  mix,
  rearDepthRatio,
  smoothstep,
} from './transmission-geometry'
import {
  depthHeatmapFragmentShader,
  depthHeatmapVertexShader,
  patchTransmissionMaterial,
  resolveTransmissionDebugMode,
  resolveTransmissionSupportLayers,
  type TransmissionMaterialInstance,
  type TransmissionShaderMode,
} from './transmission-material'
import { captureTransmissionTelemetry } from './transmission-telemetry'
import type { LensStateAdapter } from '../lens/lens-state'
import type { FluidGlassStore } from './store'
import type {
  FluidGlassEnvironmentSource,
  FluidGlassDebugView,
  FluidGlassMaterialPreset,
  FluidGlassQuality,
  FluidGlassTelemetry,
  FluidTransmissionMaterial,
} from '../types'

export function TransmissionScene({
  debugView,
  environment,
  lens: lensState,
  onFailure,
  onReady,
  lightDirection,
  material,
  materialPreset,
  onTelemetry,
  quality,
  shaderMode,
  store,
}: {
  debugView: FluidGlassDebugView
  environment: FluidGlassEnvironmentSource
  lens: LensStateAdapter
  onFailure: () => void
  onReady: () => void
  lightDirection: readonly [number, number]
  material: FluidTransmissionMaterial
  materialPreset: FluidGlassMaterialPreset
  onTelemetry?: (telemetry: FluidGlassTelemetry) => void
  quality: FluidGlassQuality
  shaderMode: TransmissionShaderMode
  store: FluidGlassStore
}) {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const scene = useThree((state) => state.scene)
  const size = useThree((state) => state.size)
  const texture = useEnvironmentTexture(environment, onFailure)
  const theme = useFluidGlassTheme(environment, gl.domElement)
  const reflectionTexture = useMemo(() => createReflectionTexture(theme), [theme])
  const environmentScene = useMemo(() => new Scene(), [])
  const renderTarget = useFBO({
    depthBuffer: false,
    samples: 0,
    stencilBuffer: false,
    type: UnsignedByteType,
  })
  const materialRef = useRef<TransmissionMaterialInstance>(null)
  const meshRef = useRef<Mesh>(null)
  const drawingBufferSize = useMemo(() => new Vector2(), [])
  const luminanceSampleWidth = 48
  const luminanceSampleHeight = 20
  const backgroundPixel = useMemo(
    () => new Uint8Array(luminanceSampleWidth * luminanceSampleHeight * 4),
    [],
  )
  const transmittedPixel = useMemo(
    () => new Uint8Array(luminanceSampleWidth * luminanceSampleHeight * 4),
    [],
  )
  const lastTelemetryAt = useRef(Number.NEGATIVE_INFINITY)
  const descriptorKeyRef = useRef('')
  const [descriptor, setDescriptor] = useState(() => getVolumeDescriptor(store))
  const geometry = useMemo(() => createVolumeGeometry(descriptor), [descriptor])
  const frontNormalHistogram = useMemo(
    () => measureFrontNormalHistogram(geometry, descriptor),
    [descriptor, geometry],
  )
  const resolvedQuality = resolveFluidGlassQuality(quality)
  const dragMaterial = FLUID_TRANSMISSION_MATERIAL_PRESETS.dragPeak
  const samples = materialPreset === 'expressive' ? 8 : resolvedQuality.scatterSamples
  const isFramebufferDebug =
    debugView === 'fbo-raw' || debugView === 'fbo-overlay' || debugView === 'fbo-difference'
  const darkTheme = theme.dark
  const { reflection: reflectionEnabled } = resolveTransmissionSupportLayers(debugView, material)
  const environmentKey =
    environment.type === 'image'
      ? `image:${environment.src}`
      : environment.type === 'theme'
        ? `theme:${environment.pattern ?? 'calm'}:${environment.tone ?? 'auto'}`
        : `theme:calm:auto`

  useEffect(() => {
    updateRenderTargetColorSpace(renderTarget)
  }, [renderTarget])

  useEffect(() => {
    scene.environment = reflectionEnabled ? reflectionTexture : null
    return () => {
      if (scene.environment === reflectionTexture) scene.environment = null
    }
  }, [darkTheme, reflectionEnabled, reflectionTexture, scene])
  useEffect(() => () => reflectionTexture.dispose(), [reflectionTexture])

  useEffect(() => {
    descriptorKeyRef.current = descriptor.key
    return store.subscribe(() => {
      const next = getVolumeDescriptor(store)
      if (next.key === descriptorKeyRef.current) return
      descriptorKeyRef.current = next.key
      setDescriptor(next)
    })
  }, [descriptor.key, store])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => lensState.subscribe(invalidate), [invalidate, lensState])
  useEffect(() => {
    lastTelemetryAt.current = Number.NEGATIVE_INFINITY
    invalidate()
    const frame = requestAnimationFrame(invalidate)
    return () => cancelAnimationFrame(frame)
  }, [debugView, environmentKey, invalidate, material, materialPreset, texture, theme])

  useFrame((state, delta) => {
    const previousTarget = gl.getRenderTarget()
    gl.setRenderTarget(renderTarget)
    gl.clear(true, true, true)
    gl.render(environmentScene, camera)
    gl.setRenderTarget(previousTarget)

    if (environment.type !== 'image' || texture) onReady()

    const mesh = meshRef.current
    const transmission = materialRef.current
    if (!mesh) return

    const snapshot = lensState.read()
    const lens = {
      ...store.current,
      ...snapshot.current,
      ...snapshot.motion,
      opacity: snapshot.opacity,
      interactionEnergy: snapshot.motion.energy,
    }
    const dragAmount = smoothstep(0.68, 1, lens.interactionEnergy)
    const speed = Math.hypot(lens.velocityX, lens.velocityY)
    const width = Math.max(1, lens.width * lens.scaleX)
    const height = Math.max(1, lens.height * lens.scaleY)

    mesh.visible = !isFramebufferDebug && lens.opacity > 0.01 && lens.width > 1 && lens.height > 1
    mesh.position.set(
      lens.x + lens.width / 2 - size.width / 2,
      size.height / 2 - lens.y - lens.height / 2,
      0,
    )
    mesh.scale.set(width / descriptor.aspect, height, height)
    mesh.rotation.set(
      0,
      debugView === 'side-profile' ? Math.PI * 0.39 : 0,
      clamp(lens.velocityX / 900, -1, 1) * -0.035 * dragAmount,
    )

    const currentIor = mix(material.ior, dragMaterial.ior, dragAmount)
    const currentThickness = mix(material.thickness, dragMaterial.thickness, dragAmount)
    const currentRoughness = mix(material.roughness, dragMaterial.roughness, dragAmount)
    const currentAnisotropy = mix(material.anisotropy, dragMaterial.anisotropy, dragAmount)
    const currentChromaticAberration =
      debugView === 'transmission-only'
        ? 0
        : mix(material.chromaticAberration, dragMaterial.chromaticAberration, dragAmount)
    const currentDistortion = mix(material.distortion, dragMaterial.distortion, dragAmount)
    const currentDistortionScale = mix(
      material.distortionScale,
      dragMaterial.distortionScale,
      dragAmount,
    )
    const currentTemporalDistortion = mix(
      material.temporalDistortion,
      dragMaterial.temporalDistortion,
      dragAmount,
    )

    if (transmission) {
      transmission.opacity = clamp(lens.opacity, 0, 1)
      transmission.ior = currentIor

      transmission.thickness = currentThickness
      transmission.roughness = currentRoughness
      transmission.anisotropicBlur = currentAnisotropy
      transmission.chromaticAberration = currentChromaticAberration
      transmission.distortion = currentDistortion
      transmission.distortionScale = currentDistortionScale
      transmission.temporalDistortion = currentTemporalDistortion
      transmission.attenuationDistance = material.attenuationDistance
      transmission.attenuationColor.set(material.attenuationColor)
      transmission.time += delta
      const compiledShader = transmission.userData.fluidGlassShader as
        | { uniforms: Record<string, { value: unknown }> }
        | undefined
      const debugUniform = compiledShader?.uniforms.uFluidGlassDebugMode
      if (debugUniform) debugUniform.value = resolveTransmissionDebugMode(debugView)
    }

    const elapsedMs = state.clock.elapsedTime * 1000
    if (onTelemetry && elapsedMs - lastTelemetryAt.current >= 80) {
      lastTelemetryAt.current = elapsedMs
      onTelemetry(
        captureTransmissionTelemetry({
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
        }),
      )
    }

    if (dragAmount > 0.04 && speed > 1) state.invalidate()
  })

  return (
    <>
      {createPortal(
        <TransmissionEnvironment
          environment={environment}
          height={size.height}
          theme={theme}
          texture={texture}
          width={size.width}
        />,
        environmentScene,
      )}

      <mesh position={[0, 0, -60]}>
        <planeGeometry args={[size.width, size.height]} />
        <meshBasicMaterial map={renderTarget.texture} toneMapped={false} depthWrite={false} />
      </mesh>

      {isFramebufferDebug ? (
        <FramebufferDiagnostic
          debugView={debugView}
          framebuffer={renderTarget.texture}
          height={size.height}
          source={texture}
          width={size.width}
        />
      ) : null}

      <ambientLight
        color={theme.reflection}
        intensity={reflectionEnabled ? (darkTheme ? 0.002 : 0.006) : 0}
      />

      <directionalLight
        color={theme.reflection}
        intensity={reflectionEnabled ? (darkTheme ? 0.03 : 0.05) : 0}
        position={[lightDirection[0] * 220, lightDirection[1] * 220, 180]}
      />

      <mesh ref={meshRef} geometry={geometry} renderOrder={2}>
        {debugView === 'normals' || debugView === 'side-profile' ? (
          <meshNormalMaterial side={DoubleSide} toneMapped={false} />
        ) : debugView === 'wireframe' ? (
          <meshBasicMaterial color="#4de8ff" side={DoubleSide} toneMapped={false} wireframe />
        ) : debugView === 'depth-heatmap' ? (
          <shaderMaterial
            depthTest
            depthWrite
            fragmentShader={depthHeatmapFragmentShader}
            side={DoubleSide}
            toneMapped={false}
            vertexShader={depthHeatmapVertexShader}
          />
        ) : (
          <MeshTransmissionMaterial
            ref={(instance) => {
              const transmissionInstance =
                instance as unknown as TransmissionMaterialInstance | null
              if (transmissionInstance && shaderMode === 'custom') {
                patchTransmissionMaterial(transmissionInstance)
              }
              materialRef.current = transmissionInstance
            }}
            anisotropicBlur={material.anisotropy}
            attenuationColor={material.attenuationColor}
            attenuationDistance={material.attenuationDistance}
            backside
            backsideThickness={material.thickness * rearDepthRatio}
            buffer={renderTarget.texture}
            chromaticAberration={material.chromaticAberration}
            clearcoat={reflectionEnabled ? (darkTheme ? 0.12 : 0.08) : 0}
            clearcoatRoughness={0.35}
            color="#ffffff"
            distortion={material.distortion}
            distortionScale={material.distortionScale}
            envMapIntensity={reflectionEnabled ? (darkTheme ? 0.6 : 0.35) : 0}
            ior={material.ior}
            metalness={0}
            opacity={1}
            roughness={material.roughness}
            samples={samples}
            temporalDistortion={material.temporalDistortion}
            thickness={material.thickness}
            transmission={1}
          />
        )}
      </mesh>
    </>
  )
}
