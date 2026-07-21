import { Slot } from '@radix-ui/react-slot'
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

import { useFluidGlassStore } from '../context/fluid-glass-context'
import type { FluidGlassBehavior, FluidGlassTargetProps } from '../types'
import { cn } from '@/shared/lib/utils'

const defaultBehaviors: ReadonlyArray<FluidGlassBehavior> = ['selection', 'hover', 'press']
const maximumPointerVelocity = 1_600
const normalizationVelocity = 1_200

function resolvePointerVelocity(rawX: number, rawY: number, smoothedX: number, smoothedY: number) {
  const smoothedMagnitude = Math.hypot(smoothedX, smoothedY)
  const clampScale = Math.min(1, maximumPointerVelocity / Math.max(1, smoothedMagnitude))
  return {
    rawX,
    rawY,
    smoothedX,
    smoothedY,
    normalized: Math.min(1, smoothedMagnitude / normalizationVelocity),
    clampedX: smoothedX * clampScale,
    clampedY: smoothedY * clampScale,
  }
}

export function FluidGlassTarget({
  active = false,
  asChild = false,
  behaviors = defaultBehaviors,
  children,
  className,
  disabled = false,
  dragBounds = 96,
  draggable = false,
  id,
  radius = 'inherit',
  scopeId = 'default',
  shape = 'rounded-rect',
}: FluidGlassTargetProps) {
  const store = useFluidGlassStore()
  const elementRef = useRef<HTMLElement | null>(null)
  const releaseTimeoutRef = useRef<number | null>(null)
  const previousActiveRef = useRef(active)
  const registrationOptionsRef = useRef({ active, behaviors, disabled, radius, scopeId, shape })
  registrationOptionsRef.current = { active, behaviors, disabled, radius, scopeId, shape }
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    startTime: number
    lastX: number
    lastY: number
    lastTime: number
    velocityX: number
    velocityY: number
    peakVelocityX: number
    peakVelocityY: number
  } | null>(null)
  const behaviorSet = new Set(behaviors)
  const supportsPress = behaviorSet.has('press')
  const supportsDrag = !disabled && draggable && behaviorSet.has('drag')

  const setElementRef = useCallback(
    (element: HTMLElement | null) => {
      if (elementRef.current === element) return
      elementRef.current = element
      if (element) store?.registerTarget(id, element, registrationOptionsRef.current)
      else store?.unregisterTarget(id)
    },
    [id, store],
  )

  useEffect(() => {
    const becameActive = active && !previousActiveRef.current
    previousActiveRef.current = active
    store?.updateTarget(
      id,
      { active },
      {
        eventType: 'active-prop-change',
        sourceTargetId: id,
        reason: `active prop changed to ${active}`,
      },
    )
    if (becameActive) store?.commitSelection(scopeId, id)
  }, [active, id, scopeId, store])

  useEffect(() => {
    store?.updateTarget(
      id,
      { behaviors, disabled, radius, scopeId, shape },
      {
        eventType: 'selection-change',
        sourceTargetId: id,
        reason: 'target behaviors or geometry configuration changed',
      },
    )
  }, [behaviors, disabled, id, radius, scopeId, shape, store])

  useEffect(
    () => () => {
      if (releaseTimeoutRef.current !== null) window.clearTimeout(releaseTimeoutRef.current)
    },
    [],
  )

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (disabled) return
    if (releaseTimeoutRef.current !== null) {
      window.clearTimeout(releaseTimeoutRef.current)
      releaseTimeoutRef.current = null
    }
    if (supportsPress) {
      store?.updateTarget(
        id,
        { pressed: true },
        { eventType: 'pointer-down', sourceTargetId: id, reason: 'pointer pressed target' },
      )
    }
    if (!supportsDrag || dragRef.current) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: 0,
      offsetY: 0,
      startTime: event.timeStamp,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
      peakVelocityX: 0,
      peakVelocityY: 0,
    }
    store?.updateTarget(
      id,
      { dragged: true },
      { eventType: 'pointer-down', sourceTargetId: id, reason: 'drag capture started' },
    )
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const nextX = Math.max(-dragBounds, Math.min(dragBounds, event.clientX - drag.startX))
    const nextY = Math.max(-dragBounds, Math.min(dragBounds, event.clientY - drag.startY))
    const deltaSeconds = Math.max(0.001, (event.timeStamp - drag.lastTime) / 1000)
    const rawVelocityX = (event.clientX - drag.lastX) / deltaSeconds
    const rawVelocityY = (event.clientY - drag.lastY) / deltaSeconds
    const smoothingAlpha = 1 - Math.exp(-deltaSeconds * 24)
    const velocityX = drag.velocityX + (rawVelocityX - drag.velocityX) * smoothingAlpha
    const velocityY = drag.velocityY + (rawVelocityY - drag.velocityY) * smoothingAlpha
    const velocity = resolvePointerVelocity(rawVelocityX, rawVelocityY, velocityX, velocityY)
    drag.offsetX = nextX
    drag.offsetY = nextY
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    drag.lastTime = event.timeStamp
    drag.velocityX = velocityX
    drag.velocityY = velocityY
    if (Math.hypot(velocityX, velocityY) > Math.hypot(drag.peakVelocityX, drag.peakVelocityY)) {
      drag.peakVelocityX = velocityX
      drag.peakVelocityY = velocityY
    }

    event.currentTarget.style.translate = `${nextX}px ${nextY}px`
    store?.updatePointerVelocity(id, velocity)
    store?.scheduleMeasurement()
  }

  const endPointerInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    if (supportsPress) {
      store?.updateTarget(
        id,
        { pressed: false },
        { eventType: 'pointer-up', sourceTargetId: id, reason: 'pointer released target' },
      )
    }
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    const finishRelease = () => {
      releaseTimeoutRef.current = null
      store?.updatePointerVelocity(id, resolvePointerVelocity(0, 0, 0, 0))
      store?.updateTarget(
        id,
        { dragged: false },
        { eventType: 'pointer-up', sourceTargetId: id, reason: 'drag release settled' },
      )
      store?.scheduleMeasurement()
    }
    const gestureDuration = Math.max(16, event.timeStamp - drag.startTime)
    const averageVelocityX = ((event.clientX - drag.startX) / gestureDuration) * 1000
    const averageVelocityY = ((event.clientY - drag.startY) / gestureDuration) * 1000
    const peakEnergy = Math.hypot(drag.peakVelocityX, drag.peakVelocityY)
    const averageEnergy = Math.hypot(averageVelocityX, averageVelocityY)
    const releaseVelocityX = averageEnergy > peakEnergy ? averageVelocityX : drag.peakVelocityX
    const releaseVelocityY = averageEnergy > peakEnergy ? averageVelocityY : drag.peakVelocityY
    const releaseEnergy = Math.max(peakEnergy, averageEnergy)
    const releaseDistance = Math.hypot(drag.offsetX, drag.offsetY)
    if (releaseEnergy > 60 || releaseDistance > 24) {
      const handoffEnergy = Math.min(900, Math.max(releaseEnergy, releaseDistance * 8))
      const handoffDirectionX = releaseEnergy > 1 ? releaseVelocityX : drag.offsetX
      const handoffDirectionY = releaseEnergy > 1 ? releaseVelocityY : drag.offsetY
      const handoffMagnitude = Math.max(1, Math.hypot(handoffDirectionX, handoffDirectionY))
      const handoffX = (handoffDirectionX / handoffMagnitude) * handoffEnergy
      const handoffY = (handoffDirectionY / handoffMagnitude) * handoffEnergy
      store?.updatePointerVelocity(
        id,
        resolvePointerVelocity(averageVelocityX, averageVelocityY, handoffX, handoffY),
      )
      releaseTimeoutRef.current = window.setTimeout(finishRelease, 220)
    } else {
      finishRelease()
    }
  }

  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={setElementRef}
      data-fluid-glass-target={id}
      className={cn('relative', className)}
      onFocus={(event) => {
        if (!disabled && event.currentTarget.matches(':focus-visible')) {
          store?.updateTarget(
            id,
            { focused: true },
            {
              eventType: 'focus',
              sourceScopeId: scopeId,
              sourceTargetId: id,
              reason: 'focus-visible target changed lens scope',
            },
          )
        }
      }}
      onBlur={() =>
        store?.updateTarget(
          id,
          { focused: false },
          {
            eventType: 'blur',
            sourceScopeId: scopeId,
            sourceTargetId: id,
            reason: 'target lost focus-visible ownership',
          },
        )
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerInteraction}
      onPointerCancel={endPointerInteraction}
    >
      {children}
    </Comp>
  )
}
