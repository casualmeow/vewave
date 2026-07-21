import { MeshTransmissionMaterial, useFBO } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DoubleSide, Scene, UnsignedByteType, Vector2, type Mesh } from 'three'

import { FLUID_TRANSMISSION_MATERIAL_PRESETS, resolveFluidGlassQuality } from '../constants'
import {
  FramebufferDiagnostic,
  TransmissionEnvironment,
  createReflectionTexture,
  readDarkMode,
  updateRenderTargetColorSpace,
  useEnvironmentTexture,
} from './transmission-environment'
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
  const texture = useEnvironmentTexture(environment)
  const reflectionTexture = useMemo(createReflectionTexture, [])
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
  const darkTheme =
    environment.type === 'theme' &&
    (environment.tone === 'dark' || (environment.tone === 'auto' && readDarkMode(environment)))
  const { reflection: reflectionEnabled } = resolveTransmissionSupportLayers(debugView, material)
  const environmentKey =
    environment.type === 'image'
      ? `image:${environment.src}`
      : `theme:${environment.pattern ?? 'calm'}:${environment.tone ?? 'auto'}`

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
  useEffect(() => store.subscribe(invalidate), [invalidate, store])
  useEffect(() => {
    lastTelemetryAt.current = Number.NEGATIVE_INFINITY
    invalidate()
    const frame = requestAnimationFrame(invalidate)
    return () => cancelAnimationFrame(frame)
  }, [debugView, environmentKey, invalidate, material, materialPreset, texture])

  useFrame((state, delta) => {
    const previousTarget = gl.getRenderTarget()
    gl.setRenderTarget(renderTarget)
    gl.clear(true, true, true)
    gl.render(environmentScene, camera)
    gl.setRenderTarget(previousTarget)

    const mesh = meshRef.current
    const transmission = materialRef.current
    if (!mesh) return

    const lens = store.current
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
      // Material thickness is local-space: three's getVolumeTransmissionRay
      // multiplies it by the mesh's model scale (= height), which yields the
      // intended world ray length of currentThickness * height.
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
      {/*
        Alpha/compositing contract: the same controlled environment is rendered
        twice — once into the FBO (portal scene) that the transmission material
        refracts, and once into the main scene as the visible backdrop, so the
        canvas reproduces the environment 1:1 outside the lens (verified by the
        fbo-difference view). Inside the mesh footprint the material's output is
        the refracted FBO sample itself (base image, alpha 1) — it replaces the
        backdrop instead of layering a low-opacity effect over it.
      */}
      {createPortal(
        <TransmissionEnvironment
          environment={environment}
          height={size.height}
          texture={texture}
          width={size.width}
        />,
        environmentScene,
      )}

      <TransmissionEnvironment
        environment={environment}
        height={size.height}
        texture={texture}
        width={size.width}
      />

      {isFramebufferDebug ? (
        <FramebufferDiagnostic
          debugView={debugView}
          framebuffer={renderTarget.texture}
          height={size.height}
          source={texture}
          width={size.width}
        />
      ) : null}

      <ambientLight intensity={reflectionEnabled ? (darkTheme ? 0.002 : 0.006) : 0} />
      {/*
        No shadow-map shadow: a transparent lens must not cast the polygonal
        silhouette of its own mesh (it rendered as a jagged starburst on light
        backgrounds). If an external shadow returns it must be a separate
        analytic capsule, never the mesh silhouette through a shadow map.
      */}
      <directionalLight
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
            // Fresnel gates the environment reflection (F0 ≈ 0.7%), so a high
            // intensity yields only a directional partial edge highlight — the
            // clear center picks up well under 1% of it.
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
