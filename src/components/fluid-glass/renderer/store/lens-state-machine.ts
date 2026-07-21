import { createEmptyLensSnapshot } from './lens-motion-controller'
import type { FluidGlassTargetState, FluidGlassTransitionCommand } from '../../types'
import type { LensMotionController } from './lens-motion-controller'
import type { MaterialState } from './material-state'

export class LensStateMachine {
  readonly desired = createEmptyLensSnapshot()

  private latestAppliedGeneration = 0

  constructor(
    private readonly materialState: MaterialState,
    private readonly motion: LensMotionController,
    private readonly getGroup: () => HTMLElement | null,
  ) {}

  retarget(command: FluidGlassTransitionCommand, selected: FluidGlassTargetState | null) {
    if (command.generation < this.latestAppliedGeneration) return false
    this.latestAppliedGeneration = command.generation

    const group = this.getGroup()
    if (group) {
      if (command.targetId) group.dataset.fluidGlassLens = command.targetId
      else delete group.dataset.fluidGlassLens
    }

    if (!command.targetId) {
      this.desired.opacity = 0
      this.motion.retarget(command.generation, null, this.desired, null)
      return true
    }

    if (!command.rect || !selected || selected.id !== command.targetId) return true

    const speedX = Math.abs(selected.pointerVelocityX)
    const speedY = Math.abs(selected.pointerVelocityY)
    const totalSpeed = Math.min(900, Math.hypot(speedX, speedY))
    const dragEnergy = selected.dragged ? Math.min(1, totalSpeed / 900) : 0
    const dominantX = speedX >= speedY
    const material = this.materialState.resolveInteraction(selected, dragEnergy)

    Object.assign(this.desired, command.rect, material, {
      shape: command.shape,
      radius: command.radius,
      rawVelocityX: selected.rawPointerVelocityX,
      rawVelocityY: selected.rawPointerVelocityY,
      smoothedVelocityX: selected.smoothedPointerVelocityX,
      smoothedVelocityY: selected.smoothedPointerVelocityY,
      normalizedVelocity: selected.normalizedPointerVelocity,
      clampedVelocityX: selected.pointerVelocityX,
      clampedVelocityY: selected.pointerVelocityY,
      scaleX: selected.dragged
        ? dominantX
          ? 1 + dragEnergy * 0.06
          : 1 - dragEnergy * 0.04
        : selected.pressed
          ? 0.992
          : 1,
      scaleY: selected.dragged
        ? dominantX
          ? 1 - dragEnergy * 0.04
          : 1 + dragEnergy * 0.06
        : selected.pressed
          ? 0.985
          : 1,
      velocityX: selected.dragged ? selected.pointerVelocityX : 0,
      velocityY: selected.dragged ? selected.pointerVelocityY : 0,
    })

    this.motion.retarget(command.generation, command.targetId, this.desired, {
      dragEnergy,
      dragged: selected.dragged,
      pointerVelocityX: selected.pointerVelocityX,
      pointerVelocityY: selected.pointerVelocityY,
    })
    return true
  }
}
