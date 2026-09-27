import { FLUID_GLASS_REDUCED_MOTION_LERP, FLUID_GLASS_SPRING } from '../../constants'
import type { FluidGlassLensSnapshot } from '../../types'
import type { RendererScheduler } from './renderer-scheduler'
import type { GlassMotion } from '@/shared/theme/contract'
import { glassMotionProfiles } from '@/shared/theme/glass-motion'

type AnimatedKey = keyof Pick<
  FluidGlassLensSnapshot,
  'x' | 'y' | 'width' | 'height' | 'radius' | 'opacity' | 'refraction' | 'highlight' | 'shadow'
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
]

const geometryKeys = ['x', 'y', 'width', 'height', 'radius'] as const
const RETARGET_REFERENCE_SPEED = 700
const CROSS_AXIS_RATIO = 0.4
const DEFORMATION_SPRING = { stiffness: 190, damping: 17 }
const VELOCITY_LAG = 9
const IDLE_SPEED = 2

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

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

export class LensMotionController {
  readonly current = createEmptyLensSnapshot()

  private readonly velocity = Object.fromEntries(animatedKeys.map((key) => [key, 0])) as Record<
    AnimatedKey,
    number
  >

  private baseScaleX = 1
  private baseScaleY = 1
  private baseEnergy = 0.18
  private deformX = 0
  private deformY = 0
  private deformVelocityX = 0
  private deformVelocityY = 0
  private desired: FluidGlassLensSnapshot | null = null
  private lastInteraction: LensMotionInteraction | null = null
  private lastTimestamp = 0
  private latestAppliedGeneration = 0
  private targetId: string | null = null
  private reducedMotion: boolean
  private initialized = false
  private motionProfile: GlassMotion = 'fluid'
  private settleAt = 0
  private travel: { from: FluidGlassLensSnapshot; startedAt: number } | null = null

  constructor(
    private readonly scheduler: RendererScheduler,
    reducedMotion = false,
  ) {
    this.reducedMotion = reducedMotion
  }

  private get canDeform() {
    return !this.reducedMotion && this.motionProfile === 'fluid'
  }

  setMotionProfile(profile: GlassMotion) {
    if (this.motionProfile === profile) return
    this.motionProfile = profile
    if (this.desired) {
      this.retarget(this.latestAppliedGeneration, this.targetId, this.desired, this.lastInteraction)
    }
  }

  setReducedMotion(reducedMotion: boolean) {
    if (this.reducedMotion === reducedMotion) return
    this.reducedMotion = reducedMotion
    if (reducedMotion) this.neutralizeDeformation()
    if (this.desired) {
      this.retarget(this.latestAppliedGeneration, this.targetId, this.desired, this.lastInteraction)
    }
  }

  private neutralizeDeformation() {
    this.deformX = 0
    this.deformY = 0
    this.deformVelocityX = 0
    this.deformVelocityY = 0
    this.current.scaleX = this.baseScaleX
    this.current.scaleY = this.baseScaleY
    this.current.velocityX = 0
    this.current.velocityY = 0
    this.current.normalizedVelocity = 0
    this.current.interactionEnergy = this.baseEnergy
  }

  private snapTo(desired: FluidGlassLensSnapshot) {
    this.scheduler.cancelAnimation()
    this.travel = null
    Object.assign(this.current, desired)
    this.baseScaleX = this.canDeform ? desired.scaleX : 1
    this.baseScaleY = this.canDeform ? desired.scaleY : 1
    this.baseEnergy = desired.interactionEnergy
    this.neutralizeDeformation()
    for (const key of animatedKeys) this.velocity[key] = 0
    this.initialized = true
    this.scheduler.notify()
  }

  retarget(
    generation: number,
    targetId: string | null,
    desired: FluidGlassLensSnapshot,
    interaction: LensMotionInteraction | null,
  ) {
    if (generation < this.latestAppliedGeneration) return false
    const shouldSnap =
      !this.initialized ||
      this.reducedMotion ||
      this.motionProfile === 'off' ||
      this.current.width <= 0 ||
      this.current.height <= 0
    const geometryChanged =
      !this.desired || geometryKeys.some((key) => this.desired![key] !== desired[key])
    if (interaction?.dragged) {
      this.travel = null
    } else if (!shouldSnap && geometryChanged) {
      this.travel = { from: { ...this.current }, startedAt: performance.now() }
    }
    this.latestAppliedGeneration = generation
    this.targetId = targetId
    this.desired = { ...desired }
    this.lastInteraction = interaction ? { ...interaction } : null
    this.settleAt = performance.now() + glassMotionProfiles[this.motionProfile].settleMs

    if (!interaction) {
      if (shouldSnap) {
        this.snapTo(desired)
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
      clampedVelocityX: desired.clampedVelocityX,
      clampedVelocityY: desired.clampedVelocityY,
    })

    if (
      interaction.dragged &&
      interaction.dragEnergy > 0.02 &&
      this.initialized &&
      this.canDeform
    ) {
      const velocityResponse = 0.72
      this.baseScaleX += (desired.scaleX - this.baseScaleX) * velocityResponse
      this.baseScaleY += (desired.scaleY - this.baseScaleY) * velocityResponse
      this.baseEnergy += (desired.interactionEnergy - this.baseEnergy) * velocityResponse

      this.current.scaleX = this.baseScaleX * (1 + this.deformX)
      this.current.scaleY = this.baseScaleY * (1 + this.deformY)
      this.current.interactionEnergy = Math.max(this.baseEnergy, desired.normalizedVelocity)
      this.current.normalizedVelocity = desired.normalizedVelocity
      this.current.velocityX = interaction.pointerVelocityX
      this.current.velocityY = interaction.pointerVelocityY
    }

    if (shouldSnap) {
      this.snapTo(desired)
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
    if (!this.lastInteraction?.dragged && timestamp >= this.settleAt) {
      this.settle()
      return
    }
    const profile = glassMotionProfiles[this.motionProfile]
    const delta = Math.min(0.034, Math.max(0.001, (timestamp - this.lastTimestamp) / 1000))
    this.lastTimestamp = timestamp
    let unsettled = false
    const travelProgress = this.travel
      ? Math.min(
          1,
          Math.max(0, (timestamp - this.travel.startedAt) / Math.max(1, profile.travelMs)),
        )
      : 1
    const eased = 1 - (1 - travelProgress) ** 2

    for (const key of animatedKeys) {
      const difference = this.desired[key] - this.current[key]
      if (
        !this.lastInteraction?.dragged &&
        geometryKeys.some((geometryKey) => geometryKey === key)
      ) {
        const before = this.current[key]
        this.current[key] = this.travel
          ? this.travel.from[key] + (this.desired[key] - this.travel.from[key]) * eased
          : this.desired[key]
        this.velocity[key] = (this.current[key] - before) / delta
        if (travelProgress < 1) unsettled = true
        continue
      }

      if (this.reducedMotion) {
        this.current[key] += difference * FLUID_GLASS_REDUCED_MOTION_LERP
      } else {
        this.velocity[key] += difference * FLUID_GLASS_SPRING.stiffness * delta
        this.velocity[key] *= Math.exp(-FLUID_GLASS_SPRING.damping * delta)
        this.current[key] += this.velocity[key] * delta
      }

      if (Math.abs(difference) > 0.025 || Math.abs(this.velocity[key]) > 0.025) unsettled = true
    }

    if (travelProgress === 1) this.travel = null

    const baseTargetX = this.desired.scaleX
    const baseTargetY = this.desired.scaleY
    const baseTargetEnergy = this.desired.interactionEnergy
    const baseLerp = this.reducedMotion ? FLUID_GLASS_REDUCED_MOTION_LERP : Math.min(1, delta * 12)
    this.baseScaleX += (baseTargetX - this.baseScaleX) * baseLerp
    this.baseScaleY += (baseTargetY - this.baseScaleY) * baseLerp
    this.baseEnergy += (baseTargetEnergy - this.baseEnergy) * baseLerp

    if (!this.canDeform) {
      this.baseScaleX = 1
      this.baseScaleY = 1
      this.neutralizeDeformation()
      this.current.shape = this.desired.shape
      this.scheduler.notify()
      if (unsettled) this.scheduler.scheduleAnimation(this.step)
      else this.settle()
      return
    }

    const speed = Math.hypot(this.velocity.x, this.velocity.y)
    const moving = speed > IDLE_SPEED
    const directionX = moving ? this.velocity.x / speed : 0
    const directionY = moving ? this.velocity.y / speed : 0
    const normalized = clamp01(speed / RETARGET_REFERENCE_SPEED)

    const stretch = normalized * profile.stretch
    const axisX = Math.abs(directionX)
    const axisY = Math.abs(directionY)
    const targetDeformX = stretch * (axisX - CROSS_AXIS_RATIO * axisY)
    const targetDeformY = stretch * (axisY - CROSS_AXIS_RATIO * axisX)

    this.deformVelocityX += (targetDeformX - this.deformX) * DEFORMATION_SPRING.stiffness * delta
    this.deformVelocityX *= Math.exp(-DEFORMATION_SPRING.damping * delta)
    this.deformX += this.deformVelocityX * delta

    this.deformVelocityY += (targetDeformY - this.deformY) * DEFORMATION_SPRING.stiffness * delta
    this.deformVelocityY *= Math.exp(-DEFORMATION_SPRING.damping * delta)
    this.deformY += this.deformVelocityY * delta

    const lag = Math.min(1, delta * VELOCITY_LAG)
    this.current.velocityX += (this.velocity.x - this.current.velocityX) * lag
    this.current.velocityY += (this.velocity.y - this.current.velocityY) * lag
    this.current.smoothedVelocityX = this.current.velocityX
    this.current.smoothedVelocityY = this.current.velocityY
    this.current.normalizedVelocity = normalized

    const landing = this.lastInteraction?.dragged
      ? 0
      : clamp01(1 - (this.settleAt - timestamp) / Math.max(1, profile.settleMs - profile.travelMs))
    const envelope = (1 - landing) ** 2
    const squash = Math.sin(Math.PI * landing) * 0.012
    const speedAfterLag = Math.hypot(this.current.velocityX, this.current.velocityY)
    const landingX = speedAfterLag > 1 ? Math.abs(this.current.velocityX / speedAfterLag) : 0
    const landingY = speedAfterLag > 1 ? Math.abs(this.current.velocityY / speedAfterLag) : 0
    const clampScale = (value: number) =>
      Math.max(1 - profile.compression, Math.min(1 + profile.stretch, value))
    this.current.scaleX = clampScale(
      this.baseScaleX * (1 + this.deformX * envelope - squash * landingX + squash * 0.4 * landingY),
    )
    this.current.scaleY = clampScale(
      this.baseScaleY * (1 + this.deformY * envelope - squash * landingY + squash * 0.4 * landingX),
    )

    this.current.interactionEnergy = Math.max(this.baseEnergy, normalized)

    if (
      Math.abs(this.deformX) > 0.0015 ||
      Math.abs(this.deformY) > 0.0015 ||
      Math.abs(this.deformVelocityX) > 0.0015 ||
      Math.abs(this.deformVelocityY) > 0.0015 ||
      Math.abs(this.current.velocityX) > 0.5 ||
      Math.abs(this.current.velocityY) > 0.5
    ) {
      unsettled = true
    }

    this.current.shape = this.desired.shape
    this.scheduler.notify()

    if (unsettled) this.scheduler.scheduleAnimation(this.step)
    else this.settle()
  }

  private settle() {
    if (!this.desired) return
    this.travel = null
    Object.assign(this.current, this.desired)
    for (const key of animatedKeys) this.velocity[key] = 0
    this.baseScaleX = this.canDeform ? this.desired.scaleX : 1
    this.baseScaleY = this.canDeform ? this.desired.scaleY : 1
    this.baseEnergy = this.desired.interactionEnergy
    this.neutralizeDeformation()
    this.scheduler.notify()
  }
}
