export class RendererScheduler {
  private animationFrame: number | null = null
  private measurementFrame: number | null = null
  private pendingMeasurement: (() => void) | null = null
  private readonly listeners = new Set<() => void>()

  get animationScheduled() {
    return this.animationFrame !== null
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notify() {
    for (const listener of this.listeners) listener()
  }

  scheduleAnimation(callback: (timestamp: number) => void) {
    if (this.animationFrame !== null || typeof requestAnimationFrame === 'undefined') return
    this.animationFrame = requestAnimationFrame((timestamp) => {
      this.animationFrame = null
      callback(timestamp)
    })
  }

  scheduleMeasurement(callback: () => void) {
    this.pendingMeasurement = callback
    if (this.measurementFrame !== null || typeof requestAnimationFrame === 'undefined') return
    this.measurementFrame = requestAnimationFrame(() => {
      this.measurementFrame = null
      const latestMeasurement = this.pendingMeasurement
      this.pendingMeasurement = null
      latestMeasurement?.()
    })
  }

  cancelAnimation() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
  }

  cancelMeasurement() {
    if (this.measurementFrame !== null) cancelAnimationFrame(this.measurementFrame)
    this.measurementFrame = null
    this.pendingMeasurement = null
  }

  destroy() {
    this.cancelAnimation()
    this.cancelMeasurement()
    this.listeners.clear()
  }
}
