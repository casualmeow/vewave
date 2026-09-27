import {
  ClampToEdgeWrapping,
  DataTexture,
  DataUtils,
  HalfFloatType,
  LinearFilter,
  RGBAFormat,
} from 'three'
import type {
  GlassInteractionFrame,
  GlassInteractionGeometry,
} from '@/shared/lib/glass-interaction'
import { glassInteractionBoundary } from '@/shared/lib/glass-interaction'

export const normalPatchResolution = 128
export const normalPatchExtent = 256
const half = normalPatchExtent / 2
const neutral = DataUtils.toHalfFloat(0.5)
const one = DataUtils.toHalfFloat(1)
const smooth = (low: number, high: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - low) / Math.max(0.001, high - low)))
  return t * t * (3 - 2 * t)
}

export function scenePaneDistance(x: number, y: number, geometry: GlassInteractionGeometry) {
  return glassInteractionBoundary(geometry, x, y).distance
}

export function createSceneNormalPatch() {
  const pixels = new Uint16Array(normalPatchResolution * normalPatchResolution * 4)
  for (let i = 0; i < pixels.length; i += 4) pixels.set([neutral, neutral, one, one], i)
  const texture = new DataTexture(
    pixels,
    normalPatchResolution,
    normalPatchResolution,
    RGBAFormat,
    HalfFloatType,
  )
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.generateMipmaps = false
  texture.needsUpdate = true
  let previous = ''
  let disposed = false

  return {
    texture,
    update(geometry: GlassInteractionGeometry, frame: GlassInteractionFrame, contentInset = 22) {
      if (disposed) return false

      const depthLimit = Math.min(18, Math.max(0, contentInset - 4)) - 2
      const key = [
        geometry.width,
        geometry.height,
        geometry.radius,
        depthLimit,
        frame.x,
        frame.y,
        frame.nx,
        frame.ny,
        frame.bend,
        frame.refractionGain,
        frame.velocityX,
        frame.velocityY,
      ].join(':')
      if (key === previous) return false
      previous = key
      const speed = Math.hypot(frame.velocityX, frame.velocityY)
      const tangentX = -frame.ny
      const tangentY = frame.nx
      const directionalVelocity = frame.velocityX * tangentX + frame.velocityY * tangentY

      const lag = Math.max(-16, Math.min(16, directionalVelocity * 18))
      const strength = Math.min(3, Math.max(0, frame.bend)) * frame.refractionGain
      const heightAt = (x: number, y: number) => {
        const depth = -scenePaneDistance(x, y, geometry)
        if (depth <= 2 || depth >= depthLimit) return 0
        const inward = -(x - frame.x) * frame.nx - (y - frame.y) * frame.ny

        if (inward < 0 || inward > 24) return 0
        const tangent = (x - frame.x) * tangentX + (y - frame.y) * tangentY
        const reach = 1 - smooth(88, 120, Math.abs(tangent))
        const shoulder =
          smooth(2, 5, depth) * (1 - smooth(Math.min(12, depthLimit * 0.65), depthLimit, depth))
        const trail = Math.exp(-(((tangent + lag) / 48) ** 2))
        const crest = 1 + Math.min(0.2, speed / 3) * Math.sin((tangent + lag) / 22)
        return strength * shoulder * reach * trail * crest
      }
      for (let row = 0; row < normalPatchResolution; row++) {
        for (let column = 0; column < normalPatchResolution; column++) {
          const i = (row * normalPatchResolution + column) * 4

          const x = frame.x - half + ((column + 0.5) * normalPatchExtent) / normalPatchResolution
          const y = frame.y + half - ((row + 0.5) * normalPatchExtent) / normalPatchResolution
          const depth = -scenePaneDistance(x, y, geometry)
          const inside =
            column > 0 &&
            row > 0 &&
            column < normalPatchResolution - 1 &&
            row < normalPatchResolution - 1 &&
            depth > 2 &&
            depth < depthLimit
          const dx = inside ? heightAt(x + 0.5, y) - heightAt(x - 0.5, y) : 0
          const dy = inside ? heightAt(x, y + 0.5) - heightAt(x, y - 0.5) : 0
          const nx = Math.max(-0.55, Math.min(0.55, -dx))
          const ny = Math.max(-0.55, Math.min(0.55, dy))
          const length = Math.hypot(nx, ny, 1)
          pixels[i] = DataUtils.toHalfFloat(0.5 + (nx / length) * 0.5)
          pixels[i + 1] = DataUtils.toHalfFloat(0.5 + (ny / length) * 0.5)
          pixels[i + 2] = DataUtils.toHalfFloat(0.5 + 0.5 / length)
        }
      }
      texture.repeat.set(geometry.width / normalPatchExtent, geometry.height / normalPatchExtent)
      texture.offset.set(
        -(frame.x - half) / normalPatchExtent,
        -(geometry.height - frame.y - half) / normalPatchExtent,
      )
      texture.updateMatrix()
      texture.needsUpdate = true
      return true
    },
    dispose() {
      if (!disposed) {
        disposed = true
        texture.dispose()
      }
    },
  }
}
