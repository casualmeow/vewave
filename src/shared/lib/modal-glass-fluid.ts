export const neutralFluidMap = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><path fill="rgb(128,128,128)" d="M0 0h1v1H0z"/></svg>')}`

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value))

export function createModalFluidField(width: number, height: number) {
  const scale = Math.min(1 / 7, Math.sqrt(8_192 / (width * height)))
  const columns = Math.max(4, Math.min(2_048, Math.floor(width * scale)))
  const rows = Math.max(4, Math.min(Math.floor(8_192 / columns), Math.floor(height * scale)))
  const count = columns * rows
  const heights = new Float32Array(count)
  const velocities = new Float32Array(count)
  const next = new Float32Array(count)

  return {
    columns,
    rows,
    heights,
    impulse(x: number, y: number, strength: number) {
      const cx = (x / width) * (columns - 1)
      const cy = (y / height) * (rows - 1)
      const radius = Math.max(2, Math.min(columns, rows) * 0.07)
      const reach = Math.ceil(radius * 2)
      for (let j = Math.max(1, Math.floor(cy - reach)); j < Math.min(rows - 1, cy + reach); j++) {
        for (
          let i = Math.max(1, Math.floor(cx - reach));
          i < Math.min(columns - 1, cx + reach);
          i++
        ) {
          const r2 = ((i - cx) ** 2 + (j - cy) ** 2) / (radius * radius)

          const pressure = (1 - r2) * Math.exp(-r2)
          const index = j * columns + i
          velocities[index] = clamp(velocities[index] + pressure * clamp(strength, 0.45), 0.5)
        }
      }
    },
    step() {
      let energy = 0
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < columns - 1; x++) {
          const i = y * columns + x
          const laplacian =
            heights[i - 1] +
            heights[i + 1] +
            heights[i - columns] +
            heights[i + columns] -
            4 * heights[i]
          const velocity = (velocities[i] + laplacian * 0.2 - heights[i] * 0.018) * 0.86
          velocities[i] = velocity
          next[i] = clamp(heights[i] + velocity, 1)
          energy = Math.max(energy, Math.abs(next[i]), Math.abs(velocity))
        }
      }
      heights.set(next)
      return energy
    },
    encode(pixels: Uint8ClampedArray) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const i = y * columns + x
          const dx =
            (heights[y * columns + Math.max(0, x - 1)] -
              heights[y * columns + Math.min(columns - 1, x + 1)]) *
            3
          const dy =
            (heights[Math.max(0, y - 1) * columns + x] -
              heights[Math.min(rows - 1, y + 1) * columns + x]) *
            3
          const length = Math.max(1, Math.hypot(dx, dy))
          pixels[i * 4] = 128 + Math.trunc((dx / length) * 127)
          pixels[i * 4 + 1] = 128 + Math.trunc((dy / length) * 127)
          pixels[i * 4 + 2] = Math.round(128 + heights[i] * 80)
          pixels[i * 4 + 3] = 255
        }
      }
    },
    reset() {
      heights.fill(0)
      velocities.fill(0)
      next.fill(0)
    },
  }
}

export function createModalFluidAnimator(
  width: number,
  height: number,
  publish: (href: string, active: boolean) => void,
) {
  const field = createModalFluidField(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = field.columns
  canvas.height = field.rows
  const context = canvas.getContext('2d')
  if (!context) return null
  const image = context.createImageData(field.columns, field.rows)
  let frame: number | null = null
  let previous = 0
  let disposed = false

  const reset = () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    field.reset()
    publish(neutralFluidMap, false)
  }
  const tick = (time: number) => {
    frame = null
    if (time - previous < 1000 / 30) {
      frame = requestAnimationFrame(tick)
      return
    }
    previous = time
    field.step()
    const energy = field.step()
    if (energy < 0.003) {
      reset()
      return
    }
    try {
      field.encode(image.data)
      context.putImageData(image, 0, 0)
      publish(canvas.toDataURL('image/png'), true)
    } catch {
      disposed = true
      reset()
      return
    }
    frame = requestAnimationFrame(tick)
  }
  return {
    impulse(x: number, y: number, strength: number) {
      if (disposed) return
      field.impulse(x, y, strength)
      if (frame === null) {
        previous = performance.now() - 1000 / 30
        frame = requestAnimationFrame(tick)
      }
    },
    reset,
    dispose() {
      reset()
      disposed = true
    },
  }
}
