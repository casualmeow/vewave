export function createObjectFrameLoop({
  render,
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
}: {
  render: (time: number) => boolean
  requestFrame?: typeof requestAnimationFrame
  cancelFrame?: typeof cancelAnimationFrame
}) {
  let frame: number | null = null
  let visible = true
  let disposed = false
  let dirty = false
  let lastPaint = -Infinity

  function schedule() {
    if (frame === null && visible && !disposed && dirty) frame = requestFrame(tick)
  }

  function tick(time: number) {
    frame = null
    if (!visible || disposed) return
    if (time - lastPaint >= 1000 / 30) {
      lastPaint = time
      dirty = render(time)
    }
    schedule()
  }

  return {
    invalidate() {
      dirty = true
      schedule()
    },
    setVisible(next: boolean) {
      visible = next
      if (!visible && frame !== null) {
        cancelFrame(frame)
        frame = null
      }
      if (visible) {
        dirty = true
        schedule()
      }
    },
    dispose() {
      disposed = true
      if (frame !== null) cancelFrame(frame)
      frame = null
    },
  }
}

export function objectPixelRatio(width: number, height: number, devicePixelRatio: number) {
  return Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(600_000 / Math.max(width * height, 1)))
}
