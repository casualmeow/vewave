import {
  getGlassMutedForeground,
  glassOpticalProfiles,
  readGlassThemeTokens,
  resolveGlassMaterial,
} from './glass-material'
import type { GlassIntensity, ResolvedAppearanceMode, ThemeTokens } from '@/shared/theme/contract'

export const modalGlassProfiles = glassOpticalProfiles

export function resolveModalGlassMaterial(
  mode: ResolvedAppearanceMode,
  intensity: GlassIntensity,
  tokens: Partial<ThemeTokens> = readGlassThemeTokens(),
) {
  const profile = resolveGlassMaterial({
    mode,
    intensity,
    tokens,
    role: 'dialog',
    thickness: 'thick',
  })
  const centerTint = profile.readabilityOpacity
  const edgeTint = profile.tintOpacity

  const tintProgress = Math.min(1, 20 / profile.bevel)
  return {
    ...profile,
    centerTint,
    edgeTint,
    coreTint: (centerTint - edgeTint) / (1 - edgeTint),
    tintCoreScale: 1 / (tintProgress * tintProgress * (3 - 2 * tintProgress)),
  }
}

export function getModalGlassStyle(mode: ResolvedAppearanceMode, intensity: GlassIntensity) {
  const material = resolveModalGlassMaterial(mode, intensity)
  return {
    '--modal-glass-blur': `${material.centerBlur}px`,
    '--modal-glass-tint': `${material.centerTint * 100}%`,
  }
}

export const getModalGlassMutedForeground = getGlassMutedForeground

export type ModalGlassGeometry = {
  width: number
  height: number
  radius: number
  intensity: GlassIntensity
}

export type ModalGlassMaps = ModalGlassGeometry & {
  displacement: string

  mask: string

  heightMap: string
  pointerField: string
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const smoothstep = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

export function modalGlassBoundary(x: number, y: number, geometry: ModalGlassGeometry) {
  const { width, height } = geometry
  const radius = clamp(geometry.radius, 0, Math.min(width, height) / 2)
  const dx = x - width / 2
  const dy = y - height / 2
  const qx = Math.abs(dx) - (width / 2 - radius)
  const qy = Math.abs(dy) - (height / 2 - radius)
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
  const distance = Math.min(Math.max(qx, qy), 0) + outside - radius
  const nx = outside ? (Math.max(qx, 0) / outside) * Math.sign(dx) : qx > qy ? Math.sign(dx) : 0
  const ny = outside ? (Math.max(qy, 0) / outside) * Math.sign(dy) : qx > qy ? 0 : Math.sign(dy)
  return { distance, nx, ny }
}

function sampleBevel(progress: number) {
  const s = clamp(progress)
  const height = Math.pow(1 - Math.pow(1 - s, 4), 0.25)
  const slope = Math.pow(1 - s, 3) / Math.max(0.0001, Math.pow(height, 3))
  const nz = 1 / Math.hypot(slope, 1)
  const tangent = slope * nz
  const eta = 1 / 1.5
  const bend = Math.sqrt(1 - eta * eta * (1 - nz * nz)) - eta * nz
  const travel = (bend * tangent * height) / (eta + bend * nz)
  return { height, travel, rim: 1 - nz }
}

const bevelSamples = Array.from({ length: 513 }, (_, index) => sampleBevel(index / 512))
const peakTravel = Math.max(...bevelSamples.map((sample) => sample.travel))

export function sampleModalGlass(
  geometry: ModalGlassGeometry,
  x: number,
  y: number,
  pixelSize = 1,
) {
  const { distance, nx, ny } = modalGlassBoundary(x, y, geometry)
  const profile = modalGlassProfiles[geometry.intensity]
  const progress = clamp(-distance / profile.bevel)
  const index = progress * (bevelSamples.length - 1)
  const a = bevelSamples[Math.floor(index)]
  const b = bevelSamples[Math.min(Math.floor(index) + 1, bevelSamples.length - 1)]
  const mix = index % 1
  const height = a.height + (b.height - a.height) * mix
  const travel = (a.travel + (b.travel - a.travel) * mix) / peakTravel
  const rim = a.rim + (b.rim - a.rim) * mix
  const coverage = clamp(0.5 - distance / pixelSize)
  return {
    x: travel ? -nx * travel * profile.displacement : 0,
    y: travel ? -ny * travel * profile.displacement : 0,
    height: height * coverage,
    core: smoothstep(progress),
    coverage,
    rim: rim * coverage,
  }
}

const cache = new Map<string, ModalGlassMaps>()
const maxCachedGeometries = 8
const maxTexturePixels = 750_000
const maxCachedPixels = 2_000_000
const cachePixels = new Map<string, number>()
let pointerField: string | null = null

function createPointerField() {
  if (pointerField) return pointerField
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) return null
  const image = context.createImageData(64, 64)
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const r = Math.hypot((x + 0.5 - 32) / 32, (y + 0.5 - 32) / 32)
      image.data[(y * 64 + x) * 4 + 3] = Math.round(255 * Math.pow(clamp(1 - r * r), 2))
    }
  }
  context.putImageData(image, 0, 0)
  pointerField = canvas.toDataURL('image/png')
  return pointerField
}

export function createModalGlassMaps(geometry: ModalGlassGeometry): ModalGlassMaps | null {
  const { width, height, radius, intensity } = geometry
  if (typeof document === 'undefined' || width < 8 || height < 8) return null
  const key = `${width}:${height}:${radius}:${intensity}`
  const cached = cache.get(key)
  if (cached) {
    cache.delete(key)
    cache.set(key, cached)
    return cached
  }
  const field = createPointerField()
  if (!field) return null
  const scale = Math.min(
    1,
    Math.max(0.5, 12 / modalGlassProfiles[intensity].bevel),
    Math.sqrt(maxTexturePixels / (width * height)),
  )
  const textureWidth = Math.max(1, Math.floor(width * scale))
  const textureHeight = Math.max(1, Math.floor(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = textureWidth
  canvas.height = textureHeight
  const context = canvas.getContext('2d')
  if (!context) return null
  const displacement = context.createImageData(textureWidth, textureHeight)
  const mask = context.createImageData(textureWidth, textureHeight)
  const heightMap = context.createImageData(textureWidth, textureHeight)
  const strength = modalGlassProfiles[intensity].displacement
  const pixelSize = Math.max(width / textureWidth, height / textureHeight)
  for (let y = 0; y < textureHeight; y++) {
    for (let x = 0; x < textureWidth; x++) {
      const offset = (y * textureWidth + x) * 4
      const sample = sampleModalGlass(
        geometry,
        ((x + 0.5) / textureWidth) * width,
        ((y + 0.5) / textureHeight) * height,
        pixelSize,
      )
      displacement.data.set(
        [
          128 + Math.trunc((127 * sample.x) / strength),
          128 + Math.trunc((127 * sample.y) / strength),
          128,
          255,
        ],
        offset,
      )
      mask.data.set(
        [
          Math.round(255 * sample.core),
          Math.round(255 * sample.coverage),
          Math.round(255 * sample.rim),
          255,
        ],
        offset,
      )
      heightMap.data.set([255, 255, 255, Math.round(255 * sample.height)], offset)
    }
  }
  const encode = (image: ImageData) => {
    context.putImageData(image, 0, 0)
    return canvas.toDataURL('image/png')
  }
  const maps = {
    ...geometry,
    displacement: encode(displacement),
    mask: encode(mask),
    heightMap: encode(heightMap),
    pointerField: field,
  }
  const pixels = textureWidth * textureHeight
  while (
    cache.size &&
    (cache.size >= maxCachedGeometries ||
      [...cachePixels.values()].reduce((sum, size) => sum + size, pixels) > maxCachedPixels)
  ) {
    const oldest = cache.keys().next().value!
    cache.delete(oldest)
    cachePixels.delete(oldest)
  }
  cache.set(key, maps)
  cachePixels.set(key, pixels)
  return maps
}
