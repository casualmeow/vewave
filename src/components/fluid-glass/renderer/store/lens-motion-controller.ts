import { FLUID_GLASS_REDUCED_MOTION_LERP, FLUID_GLASS_SPRING } from '../../constants'
import type { FluidGlassLensSnapshot } from '../../types'
import type { RendererScheduler } from './renderer-scheduler'

type AnimatedKey = keyof Pick<
  FluidGlassLensSnapshot,
  | 'x'
  | 'y'
  | 'width'
  | 'height'
  | 'radius'
  | 'opacity'
  | 'refraction'
  | 'highlight'
  | 'shadow'
  | 'scaleX'
  | 'scaleY'
  | 'velocityX'
  | 'velocityY'
  | 'interactionEnergy'
>

const animatedKeys: Array<AnimatedKey> = [
  'x',
  'y',
  'width',
  'height',
  'radius',
  'opacity',
  'refraction',
  'highlight',
  'shadow',
  'scaleX',
  'scaleY',
  'velocityX',
  'velocityY',
  'interactionEnergy',
]

export type LensMotionInteraction = {
  dragEnergy: number
  dragged: boolean
  pointerVelocityX: number
  pointerVelocityY: number
}

export function createEmptyLensSnapshot(): FluidGlassLensSnapshot {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    shape: 'rounded-rect',
    opacity: 0,
    refraction: 1,
    highlight: 0.9,
    shadow: 0.86,
    scaleX: 1,
    scaleY: 1,
    velocityX: 0,
    velocityY: 0,
    rawVelocityX: 0,
    rawVelocityY: 0,
    smoothedVelocityX: 0,
    smoothedVelocityY: 0,
    normalizedVelocity: 0,
    clampedVelocityX: 0,
    clampedVelocityY: 0,
    interactionEnergy: 0.18,
  }
}

export class LensMotionController {
  readonly current = createEmptyLensSnapshot()

  private readonly velocity = Object.fromEntries(animatedKeys.map((key) => [key, 0])) as Record<
    AnimatedKey,
    number
  >
  private desired: FluidGlassLensSnapshot | null = null
  private lastInteraction: LensMotionInteraction | null = null
  private lastTimestamp = 0
  private latestAppliedGeneration = 0
  private targetId: string | null = null
  private reducedMotion: boolean
  private initialized = false

  constructor(
    private readonly scheduler: RendererScheduler,
    reducedMotion = false,
  ) {
    this.reducedMotion = reducedMotion
  }

  setReducedMotion(reducedMotion: boolean) {
    this.reducedMotion = reducedMotion
    if (this.desired) {
      this.retarget(this.latestAppliedGeneration, this.targetId, this.desired, this.lastInteraction)
    }
  }

  retarget(
    generation: number,
    targetId: string | null,
    desired: FluidGlassLensSnapshot,
    interaction: LensMotionInteraction | null,
  ) {
    if (generation < this.latestAppliedGeneration) return false
    this.latestAppliedGeneration = generation
    this.targetId = targetId
    this.desired = { ...desired }
    this.lastInteraction = interaction ? { ...interaction } : null

    if (!interaction) {
      if (!this.initialized || this.reducedMotion) {
        Object.assign(this.current, desired)
        this.initialized = true
        this.scheduler.notify()
        return true
      }
      this.startAnimation()
      return true
    }

    Object.assign(this.current, {
      rawVelocityX: desired.rawVelocityX,
      rawVelocityY: desired.rawVelocityY,
      smoothedVelocityX: desired.smoothedVelocityX,
      smoothedVelocityY: desired.smoothedVelocityY,
      normalizedVelocity: desired.normalizedVelocity,
      clampedVelocityX: desired.clampedVelocityX,
      clampedVelocityY: desired.clampedVelocityY,
    })

    if (
      interaction.dragged &&
      interaction.dragEnergy > 0.02 &&
      this.initialized &&
      !this.reducedMotion
    ) {
      const velocityResponse = 0.72
      this.current.scaleX += (desired.scaleX - this.current.scaleX) * velocityResponse
      this.current.scaleY += (desired.scaleY - this.current.scaleY) * velocityResponse
      this.current.interactionEnergy +=
        (desired.interactionEnergy - this.current.interactionEnergy) * velocityResponse
      this.current.velocityX = interaction.pointerVelocityX
      this.current.velocityY = interaction.pointerVelocityY
    }

    if (!this.initialized || this.reducedMotion) {
      Object.assign(this.current, desired)
      this.initialized = true
      this.scheduler.notify()
      return true
    }

    this.startAnimation()
    return true
  }

  cancel() {
    this.scheduler.cancelAnimation()
  }

  private startAnimation() {
    if (this.scheduler.animationScheduled) return
    this.lastTimestamp = performance.now()
    this.scheduler.scheduleAnimation(this.step)
  }

  private step = (timestamp: number) => {
    if (!this.desired) return
    const delta = Math.min(0.034, Math.max(0.001, (timestamp - this.lastTimestamp) / 1000))
    this.lastTimestamp = timestamp
    let unsettled = false

    for (const key of animatedKeys) {
      const difference = this.desired[key] - this.current[key]

      if (this.reducedMotion) {
        this.current[key] += difference * FLUID_GLASS_REDUCED_MOTION_LERP
      } else {
        this.velocity[key] += difference * FLUID_GLASS_SPRING.stiffness * delta
        this.velocity[key] *= Math.exp(-FLUID_GLASS_SPRING.damping * delta)
        this.current[key] += this.velocity[key] * delta
      }

      if (Math.abs(difference) > 0.025 || Math.abs(this.velocity[key]) > 0.025) unsettled = true
    }

    this.current.shape = this.desired.shape
    this.scheduler.notify()

    if (unsettled) {
      this.scheduler.scheduleAnimation(this.step)
    } else {
      Object.assign(this.current, this.desired)
      for (const key of animatedKeys) this.velocity[key] = 0
      this.scheduler.notify()
    }
  }
}
