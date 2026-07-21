import { useEffect, useMemo, useState } from 'react'
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DataTexture,
  EquirectangularReflectionMapping,
  LinearFilter,
  NoColorSpace,
  RGBAFormat,
  ShaderMaterial,
  TextureLoader,
  UnsignedByteType,
  type Texture,
  type WebGLRenderTarget,
} from 'three'

import type { FluidGlassDebugView, FluidGlassEnvironmentSource } from '../types'

const environmentVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const environmentFragmentShader = /* glsl */ `
  uniform float uDark;
  uniform float uPattern;
  uniform float uUseImage;
  uniform sampler2D uEnvironment;
  varying vec2 vUv;

  float gridLine(float coordinate, float width) {
    float cell = abs(fract(coordinate) - 0.5);
    return smoothstep(width, min(0.5, width + 0.025), cell);
  }

  void main() {
    if (uUseImage > 0.5) {
      gl_FragColor = texture2D(uEnvironment, vUv);
      return;
    }

    vec3 lightBase = mix(vec3(0.89, 0.93, 0.94), vec3(0.77, 0.84, 0.86), vUv.y);
    vec3 darkBase = mix(vec3(0.006, 0.01, 0.016), vec3(0.018, 0.027, 0.038), vUv.y);
    vec3 color = mix(lightBase, darkBase, uDark);
    float glow = max(0.0, 1.0 - length(vUv - vec2(0.18, 0.78)) * 1.6);
    color += mix(vec3(0.025, 0.07, 0.08), vec3(0.01, 0.035, 0.045), uDark) * glow;

    if (uPattern > 0.5) {
      float fine = max(gridLine(vUv.x * 30.0, 0.465), gridLine(vUv.y * 18.0, 0.465));
      float diagonal = gridLine((vUv.x * 1.45 + vUv.y) * 13.0, 0.48);
      float accent = gridLine(vUv.x * 7.0, 0.47);
      vec3 lineColor = mix(vec3(0.18, 0.24, 0.26), vec3(0.075, 0.14, 0.17), uDark);
      color = mix(color, lineColor, fine * 0.28 + diagonal * 0.16);
      color += vec3(0.015, 0.22, 0.28) * accent * mix(0.2, 0.28, uDark);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`

const framebufferDiagnosticFragmentShader = /* glsl */ `
  uniform sampler2D uFramebuffer;
  uniform sampler2D uSource;
  uniform float uDifference;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec3 framebuffer = texture2D(uFramebuffer, vUv).rgb;
    if (uDifference > 0.5) {
      vec3 source = texture2D(uSource, vUv).rgb;
      gl_FragColor = vec4(abs(framebuffer - source) * 12.0, 1.0);
      return;
    }
    gl_FragColor = vec4(framebuffer, uOpacity);
  }
`

function createFallbackTexture() {
  const texture = new DataTexture(
    new Uint8Array([16, 24, 32, 255]),
    1,
    1,
    RGBAFormat,
    UnsignedByteType,
  )
  texture.needsUpdate = true
  return texture
}

export function createReflectionTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return createFallbackTexture()

  const base = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  base.addColorStop(0, '#89969c')
  base.addColorStop(0.5, '#d6dfe2')
  base.addColorStop(1, '#718087')
  context.fillStyle = base
  context.fillRect(0, 0, canvas.width, canvas.height)

  const softLight = context.createRadialGradient(190, 28, 4, 190, 28, 86)
  softLight.addColorStop(0, 'rgba(255, 255, 255, 0.82)')
  softLight.addColorStop(0.36, 'rgba(229, 240, 242, 0.38)')
  softLight.addColorStop(1, 'rgba(229, 240, 242, 0)')
  context.fillStyle = softLight
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = NoColorSpace
  texture.mapping = EquirectangularReflectionMapping
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export function useEnvironmentTexture(environment: FluidGlassEnvironmentSource) {
  const fallback = useMemo(createFallbackTexture, [])
  const [texture, setTexture] = useState<Texture>(fallback)
  const imageSource = environment.type === 'image' ? environment.src : null

  useEffect(() => {
    if (!imageSource) {
      setTexture(fallback)
      return
    }

    let disposed = false
    let loadedTexture: Texture | undefined
    new TextureLoader().load(imageSource, (loaded) => {
      if (disposed) {
        loaded.dispose()
        return
      }
      loadedTexture = loaded
      loaded.colorSpace = NoColorSpace
      loaded.minFilter = LinearFilter
      loaded.magFilter = LinearFilter
      loaded.wrapS = ClampToEdgeWrapping
      loaded.wrapT = ClampToEdgeWrapping
      loaded.generateMipmaps = false
      loaded.needsUpdate = true
      setTexture(loaded)
    })

    return () => {
      disposed = true
      loadedTexture?.dispose()
    }
  }, [fallback, imageSource])

  useEffect(() => () => fallback.dispose(), [fallback])
  return texture
}

export function readDarkMode(environment: FluidGlassEnvironmentSource) {
  if (environment.type === 'theme' && environment.tone && environment.tone !== 'auto') {
    return environment.tone === 'dark'
  }
  return (
    document.documentElement.dataset.resolvedMode === 'dark' ||
    document.documentElement.classList.contains('dark')
  )
}

export function TransmissionEnvironment({
  environment,
  height,
  texture,
  width,
}: {
  environment: FluidGlassEnvironmentSource
  height: number
  texture: Texture
  width: number
}) {
  const [themeDark, setThemeDark] = useState(() => readDarkMode(environment))
  const environmentTone = environment.type === 'theme' ? environment.tone : undefined
  const pattern = environment.type === 'theme' && environment.pattern === 'grid'
  const usesImage = environment.type === 'image'
  const followsTheme = !environmentTone || environmentTone === 'auto'
  const dark =
    environmentTone && environmentTone !== 'auto' ? environmentTone === 'dark' : themeDark
  const material = useMemo(
    () =>
      new ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader: environmentFragmentShader,
        toneMapped: false,
        uniforms: {
          uDark: { value: dark ? 1 : 0 },
          uEnvironment: { value: texture },
          uPattern: {
            value: pattern ? 1 : 0,
          },
          uUseImage: { value: usesImage ? 1 : 0 },
        },
        vertexShader: environmentVertexShader,
      }),
    [dark, pattern, texture, usesImage],
  )

  useEffect(() => {
    if (!followsTheme) return
    const updateDarkMode = () =>
      setThemeDark(
        document.documentElement.dataset.resolvedMode === 'dark' ||
          document.documentElement.classList.contains('dark'),
      )
    const observer = new MutationObserver(updateDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-resolved-mode'],
    })
    return () => observer.disconnect()
  }, [followsTheme])

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh material={material} position={[0, 0, -60]}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}

export function FramebufferDiagnostic({
  debugView,
  framebuffer,
  height,
  source,
  width,
}: {
  debugView: FluidGlassDebugView
  framebuffer: Texture
  height: number
  source: Texture
  width: number
}) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader: framebufferDiagnosticFragmentShader,
        toneMapped: false,
        transparent: debugView === 'fbo-overlay',
        uniforms: {
          uDifference: { value: debugView === 'fbo-difference' ? 1 : 0 },
          uFramebuffer: { value: framebuffer },
          uOpacity: { value: debugView === 'fbo-overlay' ? 0.5 : 1 },
          uSource: { value: source },
        },
        vertexShader: environmentVertexShader,
      }),
    [debugView, framebuffer, source],
  )

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh material={material} position={[0, 0, 10]} renderOrder={20}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}

// The whole transmission pipeline is raw-sRGB passthrough (matching the SDF
// renderer and the DOM backdrop): textures carry sRGB values undecoded, the
// renderer output stays linear (no encode), so environment pixels reach the
// canvas byte-identical outside the lens and single-sampled inside it.
export function updateRenderTargetColorSpace(target: WebGLRenderTarget) {
  target.texture.colorSpace = NoColorSpace
  target.texture.minFilter = LinearFilter
  target.texture.magFilter = LinearFilter
  target.texture.generateMipmaps = false
  target.texture.needsUpdate = true
}

export function pixelLuminance(pixels: Uint8Array) {
  let luminance = 0
  const pixelCount = Math.max(1, pixels.length / 4)
  for (let index = 0; index < pixels.length; index += 4) {
    luminance +=
      (0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2]) / 255
  }
  return luminance / pixelCount
}
