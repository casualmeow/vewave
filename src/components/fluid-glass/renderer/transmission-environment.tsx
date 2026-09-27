import { useEffect, useMemo, useState } from 'react'
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
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

import { fluidGlassDisplayColor } from './fluid-glass-theme'
import type { FluidGlassDebugView, FluidGlassEnvironmentSource } from '../types'
import type { FluidGlassTheme } from './fluid-glass-theme'

const environmentVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const environmentFragmentShader = `
  uniform float uDark;
  uniform vec3 uThemeBackground;
  uniform vec3 uThemeSurface;
  uniform vec3 uThemePrimary;
  uniform vec3 uThemeMuted;
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

    vec3 color = mix(uThemeBackground, uThemeSurface, vUv.y * 0.36);
    float glow = max(0.0, 1.0 - length(vUv - vec2(0.18, 0.78)) * 1.6);
    color = mix(color, uThemePrimary, glow * 0.06);

    if (uPattern > 0.5) {
      float fine = max(gridLine(vUv.x * 30.0, 0.465), gridLine(vUv.y * 18.0, 0.465));
      float diagonal = gridLine((vUv.x * 1.45 + vUv.y) * 13.0, 0.48);
      float accent = gridLine(vUv.x * 7.0, 0.47);
      vec3 lineColor = mix(uThemeBackground, uThemeMuted, 0.34);
      color = mix(color, lineColor, fine * 0.28 + diagonal * 0.16);
      color = mix(color, uThemePrimary, accent * mix(0.16, 0.22, uDark));
    }

    gl_FragColor = vec4(color, 1.0);
  }
`

const framebufferDiagnosticFragmentShader = `
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

export function createReflectionTexture(theme: FluidGlassTheme) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return createFallbackTexture()

  const base = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  const reflection = new Color(theme.reflection)
  const color = (amount: number) => new Color(theme.tint).lerp(reflection, amount).getStyle()
  base.addColorStop(0, color(theme.dark ? 0.12 : 0.36))
  base.addColorStop(0.5, color(theme.dark ? 0.32 : 0.72))
  base.addColorStop(1, color(theme.dark ? 0.06 : 0.18))
  context.fillStyle = base
  context.fillRect(0, 0, canvas.width, canvas.height)

  const softLight = context.createRadialGradient(190, 28, 4, 190, 28, 86)
  const displayReflection = fluidGlassDisplayColor(theme.reflection)
  const channels = displayReflection
    .toArray()
    .map((channel) => Math.round(channel * 255))
    .join(', ')
  softLight.addColorStop(0, `rgba(${channels}, 0.82)`)
  softLight.addColorStop(0.36, `rgba(${channels}, 0.38)`)
  softLight.addColorStop(1, `rgba(${channels}, 0)`)
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

export function useEnvironmentTexture(
  environment: FluidGlassEnvironmentSource,
  onFailure: () => void,
) {
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
    new TextureLoader().load(
      imageSource,
      (loaded) => {
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
      },
      undefined,
      () => {
        if (!disposed) onFailure()
      },
    )

    return () => {
      disposed = true
      loadedTexture?.dispose()
    }
  }, [fallback, imageSource, onFailure])

  useEffect(() => () => fallback.dispose(), [fallback])
  return texture
}

export function TransmissionEnvironment({
  environment,
  height,
  theme,
  texture,
  width,
}: {
  environment: FluidGlassEnvironmentSource
  height: number
  theme: FluidGlassTheme
  texture: Texture
  width: number
}) {
  const pattern = environment.type === 'theme' && environment.pattern === 'grid'
  const usesImage = environment.type === 'image'
  const material = useMemo(
    () =>
      new ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader: environmentFragmentShader,
        toneMapped: false,
        uniforms: {
          uDark: { value: theme.dark ? 1 : 0 },
          uThemeBackground: { value: fluidGlassDisplayColor(theme.background) },
          uThemeSurface: { value: fluidGlassDisplayColor(theme.surface) },
          uThemePrimary: { value: fluidGlassDisplayColor(theme.primary) },
          uThemeMuted: { value: fluidGlassDisplayColor(theme.muted) },
          uEnvironment: { value: texture },
          uPattern: {
            value: pattern ? 1 : 0,
          },
          uUseImage: { value: usesImage ? 1 : 0 },
        },
        vertexShader: environmentVertexShader,
      }),
    [theme, pattern, texture, usesImage],
  )

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
