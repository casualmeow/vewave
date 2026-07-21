/**
 * Chromium-first refraction backend for the glass material.
 *
 * Real optics, not blur: a displacement map is generated from the signed
 * distance field of the surface's rounded-rectangle shape, and applied to the
 * backdrop through an SVG feDisplacementMap referenced by
 * `backdrop-filter: url(#...)`. The map keeps the center neutral (0.5/0.5)
 * and concentrates displacement along the curved boundary, so content behind
 * the surface visibly bends around its edges while the middle stays stable.
 *
 * `backdrop-filter: url()` renders correctly only in Chromium engines today;
 * everything here sits behind supportsLiquidGlassRefraction() and the
 * "experimental refraction" appearance flag. The CSS material remains the
 * production backend everywhere else.
 */

export type DisplacementMapOptions = {
  width: number
  height: number
  /** Corner radius of the surface, CSS px. */
  radius: number
  /** How far the refraction zone reaches inward from the boundary, CSS px. */
  edgeWidth: number
}

export type EdgeDisplacementSampleOptions = DisplacementMapOptions & {
  x: number
  y: number
}

export type EdgeDisplacementSample = {
  x: number
  y: number
  weight: number
}

let cachedSupport: boolean | null = null

export function supportsLiquidGlassRefraction() {
  if (cachedSupport !== null) {
    return cachedSupport
  }

  if (typeof window === 'undefined' || typeof CSS === 'undefined') {
    return false
  }

  const supportsUrlFilter =
    CSS.supports('backdrop-filter', 'url(#glass)') ||
    CSS.supports('-webkit-backdrop-filter', 'url(#glass)')

  // Gecko and WebKit parse url() filters but do not render them for
  // backdrop-filter; restrict the backend to Chromium engines.
  const isChromium = /Chrom(e|ium)\//.test(navigator.userAgent) || 'userAgentData' in navigator

  cachedSupport = supportsUrlFilter && isChromium
  return cachedSupport
}

function roundedRectSdf(x: number, y: number, width: number, height: number, radius: number) {
  const qx = Math.abs(x - width / 2) - (width / 2 - radius)
  const qy = Math.abs(y - height / 2) - (height / 2 - radius)

  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))

  return t * t * (3 - 2 * t)
}

/**
 * Samples the inward edge-refraction vector for one point in a rounded rect.
 * The center and exterior remain neutral; only the inner edge band carries a
 * surface-normal displacement. Keeping this pure makes the optical geometry
 * independently verifiable from canvas and browser filter support.
 */
export function sampleRoundedRectEdgeDisplacement({
  edgeWidth,
  height,
  radius,
  width,
  x,
  y,
}: EdgeDisplacementSampleOptions): EdgeDisplacementSample {
  const resolvedRadius = Math.max(0, Math.min(radius, width / 2, height / 2))
  const distance = roundedRectSdf(x, y, width, height, resolvedRadius)

  if (distance > 0) {
    return { x: 0, y: 0, weight: 0 }
  }

  const weight = 1 - smoothstep(0, Math.max(0.001, edgeWidth), -distance)

  if (weight <= 0) {
    return { x: 0, y: 0, weight: 0 }
  }

  const gradientX =
    roundedRectSdf(x + 1, y, width, height, resolvedRadius) -
    roundedRectSdf(x - 1, y, width, height, resolvedRadius)
  const gradientY =
    roundedRectSdf(x, y + 1, width, height, resolvedRadius) -
    roundedRectSdf(x, y - 1, width, height, resolvedRadius)
  const gradientLength = Math.hypot(gradientX, gradientY)

  if (gradientLength === 0) {
    return { x: 0, y: 0, weight: 0 }
  }

  return {
    x: (gradientX / gradientLength) * weight,
    y: (gradientY / gradientLength) * weight,
    weight,
  }
}

const maxMapPixels = 90_000

/**
 * R channel = X displacement, G channel = Y displacement, 128 = neutral.
 * Returns a PNG data URL sized to (a downscaled copy of) the element; feImage
 * stretches it back over the filter region.
 */
export function createEdgeDisplacementMap({
  width,
  height,
  radius,
  edgeWidth,
}: DisplacementMapOptions): string | null {
  if (typeof document === 'undefined' || width < 8 || height < 8) {
    return null
  }

  const scale = Math.min(1, Math.sqrt(maxMapPixels / (width * height)))
  const mapWidth = Math.max(2, Math.round(width * scale))
  const mapHeight = Math.max(2, Math.round(height * scale))
  const mapRadius = Math.max(0, Math.min(radius * scale, mapWidth / 2, mapHeight / 2))
  const mapEdge = Math.max(2, edgeWidth * scale)

  const canvas = document.createElement('canvas')
  canvas.width = mapWidth
  canvas.height = mapHeight
  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  const image = context.createImageData(mapWidth, mapHeight)
  const data = image.data

  for (let y = 0; y < mapHeight; y += 1) {
    for (let x = 0; x < mapWidth; x += 1) {
      const px = x + 0.5
      const py = y + 0.5
      const offset = (y * mapWidth + x) * 4
      const displacement = sampleRoundedRectEdgeDisplacement({
        x: px,
        y: py,
        width: mapWidth,
        height: mapHeight,
        radius: mapRadius,
        edgeWidth: mapEdge,
      })

      data[offset] = Math.round(128 + 127 * displacement.x)
      data[offset + 1] = Math.round(128 + 127 * displacement.y)
      data[offset + 2] = 128
      data[offset + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)

  return canvas.toDataURL('image/png')
}
