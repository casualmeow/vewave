type FrameLoopOptions = {
  render: (seconds: number) => void
  requestFrame: (callback: FrameRequestCallback) => number
  cancelFrame: (id: number) => void
}

export function createBackdropFrameLoop({ render, requestFrame, cancelFrame }: FrameLoopOptions) {
  let frame: number | null = null
  let visible = true
  let animated = false
  let disposed = false
  let elapsed = 0
  let last: number | null = null
  let lastPaint = -Infinity
  const stop = () => {
    if (frame !== null) cancelFrame(frame)
    frame = null
    last = null
  }
  const tick: FrameRequestCallback = (now) => {
    frame = null
    if (disposed || !visible || !animated) return
    if (last !== null) elapsed += Math.min(100, now - last) / 1000
    last = now
    if (now - lastPaint >= 1000 / 30) {
      render(elapsed)
      lastPaint = now
    }
    if (!disposed) frame = requestFrame(tick)
  }
  return {
    setPolicy(next: { visible: boolean; animated: boolean }) {
      if (disposed) return
      visible = next.visible
      animated = next.animated
      stop()
      if (visible) {
        render(elapsed)
        if (animated && !disposed) frame = requestFrame(tick)
      }
    },
    invalidate() {
      if (!disposed && visible) render(elapsed)
    },
    dispose() {
      disposed = true
      stop()
    },
  }
}

export function getBackdropBufferSize(width: number, height: number, devicePixelRatio: number) {
  const scale = Math.min(1.5, devicePixelRatio, Math.sqrt(2_000_000 / Math.max(1, width * height)))
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  }
}
