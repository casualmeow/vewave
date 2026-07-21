import type { Color, ShaderMaterial } from 'three'

import type { FluidGlassDebugView, FluidTransmissionMaterial } from '../types'

export const depthHeatmapVertexShader = /* glsl */ `
  varying float vDepth;

  void main() {
    vDepth = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const depthHeatmapFragmentShader = /* glsl */ `
  varying float vDepth;

  void main() {
    float depth = clamp(vDepth / 0.26 * 0.5 + 0.5, 0.0, 1.0);
    vec3 shallow = vec3(0.03, 0.22, 0.30);
    vec3 middle = vec3(0.12, 0.78, 0.84);
    vec3 high = vec3(1.0, 0.56, 0.20);
    vec3 color = mix(shallow, middle, smoothstep(0.0, 0.62, depth));
    color = mix(color, high, smoothstep(0.62, 1.0, depth));
    gl_FragColor = vec4(color, 1.0);
  }
`

export type TransmissionMaterialInstance = ShaderMaterial & {
  anisotropicBlur: number
  attenuationColor: Color
  attenuationDistance: number
  chromaticAberration: number
  distortion: number
  distortionScale: number
  ior: number
  opacity: number
  roughness: number
  temporalDistortion: number
  thickness: number
  time: number
}

export type TransmissionShaderMode = 'stock' | 'custom'

export function resolveTransmissionDebugMode(debugView: FluidGlassDebugView) {
  if (debugView === 'curvature-weight') return 1
  if (debugView === 'dispersion-contribution') return 2
  if (debugView === 'final-dispersion') return 3
  if (debugView === 'transmission-red') return 4
  if (debugView === 'transmission-green') return 5
  if (debugView === 'transmission-blue') return 6
  return 0
}

const transmissionIsolationDebugViews: ReadonlyArray<FluidGlassDebugView> = [
  'transmission-only',
  'curvature-weight',
  'dispersion-contribution',
  'final-dispersion',
  'transmission-red',
  'transmission-green',
  'transmission-blue',
]

const geometryDebugViews: ReadonlyArray<FluidGlassDebugView> = [
  'normals',
  'wireframe',
  'side-profile',
  'depth-heatmap',
]

const framebufferDebugViews: ReadonlyArray<FluidGlassDebugView> = [
  'fbo-raw',
  'fbo-overlay',
  'fbo-difference',
]

export function isNeutralTransmissionMaterial(material: FluidTransmissionMaterial) {
  return (
    material.chromaticAberration === 0 &&
    material.anisotropy === 0 &&
    material.distortion === 0 &&
    material.temporalDistortion === 0 &&
    material.attenuationColor.toLowerCase() === '#ffffff'
  )
}

// Reflection and shadow are support layers on top of clear transmission; every
// isolation debug view and the strict neutral material must render pure
// transmission with all of them off.
export function resolveTransmissionSupportLayers(
  debugView: FluidGlassDebugView,
  material: FluidTransmissionMaterial,
) {
  const isolated =
    isNeutralTransmissionMaterial(material) ||
    transmissionIsolationDebugViews.includes(debugView) ||
    geometryDebugViews.includes(debugView) ||
    framebufferDebugViews.includes(debugView)

  return {
    reflection: !isolated && debugView !== 'transmission-shadow',
    shadow: !isolated && debugView !== 'transmission-reflection',
  }
}

export function patchTransmissionMaterial(instance: TransmissionMaterialInstance) {
  if (instance.userData.fluidGlassEdgeDispersion) return
  instance.userData.fluidGlassEdgeDispersion = true
  const compileTransmission = instance.onBeforeCompile.bind(instance)
  const baseProgramKey = instance.customProgramCacheKey.bind(instance)

  instance.onBeforeCompile = (shader, renderer) => {
    compileTransmission(shader, renderer)
    shader.uniforms.uFluidGlassDebugMode = { value: 0 }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'uniform sampler2D buffer;',
        `uniform sampler2D buffer;
        uniform float uFluidGlassDebugMode;`,
      )
      .replace(
        // The renderer uses an orthographic camera; drei's perspective-style
        // view vector (cameraPosition - pos) tilts incident rays up to ~80°
        // near the canvas edges, which smears the transmitted sample sideways.
        'vec3 v = normalize( cameraPosition - pos );',
        'vec3 v = vec3(0.0, 0.0, 1.0);',
      )
      .replace(
        'vec3 n = inverseTransformDirection( normal, viewMatrix );',
        `vec3 n = inverseTransformDirection( normal, viewMatrix );
        float fresnelAngle = 1.0 - clamp(abs(dot(normalize(n), normalize(v))), 0.0, 1.0);
        float curvatureWeight = smoothstep(0.004, 0.22, fresnelAngle);
        float weightedChromaticAberration = chromaticAberration * curvatureWeight;`,
      )
      .replace(
        'material.ior  * (1.0 + chromaticAberration *',
        'material.ior  * (1.0 + weightedChromaticAberration *',
      )
      .replace(
        'material.ior * (1.0 + 2.0 * chromaticAberration *',
        'material.ior * (1.0 + 2.0 * weightedChromaticAberration *',
      )
      .replace(
        'totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );',
        `// Composition contract: inside the lens the refracted environment sample
        // (transmission.rgb) IS the base image — material.transmission is 1, so the
        // diffuse term is replaced entirely and the fragment writes alpha 1 over
        // the transparent canvas. The calm center comes from near-zero UV
        // displacement at the flat lens center, never from blending the
        // un-refracted backdrop back in at a low contribution.
        float transmissionLuminance = dot(transmission.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 dispersionContribution = clamp(
          abs(transmission.rgb - vec3(transmissionLuminance)) * 5.0,
          0.0,
          1.0
        );
        if (uFluidGlassDebugMode > 0.5 && uFluidGlassDebugMode < 1.5) {
          totalDiffuse = vec3(curvatureWeight);
        } else if (uFluidGlassDebugMode > 1.5 && uFluidGlassDebugMode < 2.5) {
          totalDiffuse = dispersionContribution;
        } else if (uFluidGlassDebugMode > 3.5 && uFluidGlassDebugMode < 4.5) {
          totalDiffuse = vec3(transmission.r);
        } else if (uFluidGlassDebugMode > 4.5 && uFluidGlassDebugMode < 5.5) {
          totalDiffuse = vec3(transmission.g);
        } else if (uFluidGlassDebugMode > 5.5) {
          totalDiffuse = vec3(transmission.b);
        } else {
          totalDiffuse = transmission.rgb;
        }`,
      )
    instance.userData.fluidGlassShader = shader
  }
  instance.customProgramCacheKey = () => `${baseProgramKey()}:fluid-edge-dispersion-v10`
  instance.needsUpdate = true
}
