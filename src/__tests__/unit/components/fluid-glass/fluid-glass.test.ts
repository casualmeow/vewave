import { describe, expect, it } from 'vitest'

import { resolveFluidGlassBackend } from '@/components/fluid-glass/renderer/backend'
import { toGroupRelativeRect } from '@/components/fluid-glass/renderer/geometry'
import {
  FluidGlassStore,
  LensMotionController,
  LensStateMachine,
  MaterialState,
  RendererScheduler,
  TargetRegistry,
  TelemetryStore,
} from '@/components/fluid-glass/renderer/store'

function elementStub() {
  return { isConnected: true } as HTMLElement
}

function rect(x: number, y: number, width = 100, height = 40) {
  return { x, y, width, height, radius: 12, shape: 'rounded-rect' as const }
}

describe('fluid glass registry and interaction priority', () => {
  it('composes focused imperative controllers behind the compatibility facade', () => {
    const store = new FluidGlassStore()

    expect(store.registry).toBeInstanceOf(TargetRegistry)
    expect(store.stateMachine).toBeInstanceOf(LensStateMachine)
    expect(store.motion).toBeInstanceOf(LensMotionController)
    expect(store.materialState).toBeInstanceOf(MaterialState)
    expect(store.scheduler).toBeInstanceOf(RendererScheduler)
    expect(store.telemetry).toBeInstanceOf(TelemetryStore)
  })

  it('registers and unregisters targets without creating per-target renderers', () => {
    const store = new FluidGlassStore()
    store.registerTarget('rooms', elementStub(), {
      active: false,
      radius: 'inherit',
      shape: 'rounded-rect',
    })

    expect(store.targets.has('rooms')).toBe(true)
    store.unregisterTarget('rooms')
    expect(store.targets.has('rooms')).toBe(false)
  })

  it('uses drag, press, hover, then active priority for one shared lens', () => {
    const store = new FluidGlassStore()
    for (const id of ['active', 'hover', 'press', 'drag']) {
      store.registerTarget(id, elementStub(), {
        active: id === 'active',
        radius: 12,
        shape: 'rounded-rect',
      })
      const target = store.targets.get(id)
      if (target) target.rect = rect(0, 0)
    }

    store.updateTarget('hover', { hovered: true })
    store.updateTarget('press', { pressed: true })
    store.updateTarget('drag', { dragged: true })
    expect(store.getSelectedTarget()?.id).toBe('drag')

    store.updateTarget('drag', { dragged: false })
    expect(store.getSelectedTarget()?.id).toBe('press')
    store.updateTarget('press', { pressed: false })
    expect(store.getSelectedTarget()?.id).toBe('hover')
    store.updateTarget('hover', { hovered: false })
    expect(store.getSelectedTarget()?.id).toBe('active')
  })

  it('places reduced-motion retargets immediately without velocity deformation', () => {
    const store = new FluidGlassStore(true)
    store.registerTarget('first', elementStub(), {
      active: true,
      radius: 10,
      shape: 'rounded-rect',
    })
    store.registerTarget('second', elementStub(), {
      active: false,
      radius: 20,
      shape: 'capsule',
    })
    const first = store.targets.get('first')
    const second = store.targets.get('second')
    if (first) first.rect = rect(10, 20)
    if (second) second.rect = { ...rect(160, 80, 140, 44), radius: 22, shape: 'capsule' }

    store.updateTarget('first', { active: true })
    store.updateTarget('second', { hovered: true })

    expect(store.current.x).toBe(160)
    expect(store.current.y).toBe(80)
    expect(store.current.shape).toBe('capsule')
    expect(store.current.scaleX).toBe(1)
    expect(store.current.scaleY).toBe(1)
  })

  it('applies high-velocity drag deformation before the position spring settles', () => {
    const store = new FluidGlassStore()
    store.registerTarget('drag', elementStub(), {
      active: true,
      radius: 16,
      shape: 'rounded-rect',
    })
    const target = store.targets.get('drag')
    if (target) target.rect = rect(20, 20, 156, 64)
    store.updateTarget('drag', { active: true, dragged: true })
    store.updatePointerVelocity('drag', {
      rawX: 4_200,
      rawY: 40,
      smoothedX: 900,
      smoothedY: 0,
      normalized: 0.75,
      clampedX: 900,
      clampedY: 0,
    })

    expect(store.current.scaleX).toBeGreaterThanOrEqual(1.04)
    expect(store.current.scaleY).toBeLessThanOrEqual(0.972)
    expect(store.current.velocityX).toBe(900)
    expect(store.current.interactionEnergy).toBeGreaterThan(0.75)
  })

  it('returns from hover to the unchanged active selection', () => {
    const store = new FluidGlassStore(true)
    store.registerTarget('A', elementStub(), {
      active: true,
      radius: 12,
      shape: 'rounded-rect',
    })
    store.registerTarget('B', elementStub(), {
      active: false,
      radius: 12,
      shape: 'rounded-rect',
    })

    store.registry.setHoveredTarget('B', 'pointer-enter', 'test hover B')
    expect(store.resolvedTarget?.id).toBe('B')

    store.registry.setHoveredTarget(null, 'pointer-leave', 'test leave B')
    expect(store.resolvedTarget?.id).toBe('A')
  })

  it('keeps the newly selected target after its temporary hover clears', async () => {
    const store = new FluidGlassStore(true)
    store.registerTarget('A', elementStub(), {
      active: true,
      radius: 12,
      shape: 'rounded-rect',
    })
    store.registerTarget('B', elementStub(), {
      active: false,
      radius: 12,
      shape: 'rounded-rect',
    })

    store.registry.setHoveredTarget('B', 'pointer-enter', 'test hover B')
    store.updateTarget(
      'A',
      { active: false },
      { eventType: 'active-prop-change', sourceTargetId: 'A', reason: 'A deselected' },
    )
    store.updateTarget(
      'B',
      { active: true },
      { eventType: 'active-prop-change', sourceTargetId: 'B', reason: 'B selected' },
    )
    await Promise.resolve()
    store.registry.setHoveredTarget(null, 'pointer-leave', 'test leave selected B')

    expect(store.resolvedTarget?.id).toBe('B')
    expect(
      [...store.targets.values()].filter((target) => target.active).map((target) => target.id),
    ).toEqual(['B'])
  })

  it('hands rapid hover directly from B to C without returning to A', () => {
    const store = new FluidGlassStore(true)
    const resolvedSequence: Array<string | null> = []
    const elements = new Map<string, HTMLElement>()
    store.telemetry.subscribeTransitions(() => {
      resolvedSequence.push(store.telemetry.getTransitionSnapshot().resolvedTargetId)
    })
    for (const id of ['A', 'B', 'C']) {
      const element = document.createElement('button')
      elements.set(id, element)
      store.registerTarget(id, element, {
        active: id === 'A',
        radius: 12,
        shape: 'rounded-rect',
      })
    }

    resolvedSequence.length = 0
    store.handlePointerOver([elements.get('B') as HTMLElement])
    store.handlePointerOut([elements.get('B') as HTMLElement], elements.get('C') as HTMLElement)

    expect(store.resolvedTarget?.id).toBe('C')
    expect(resolvedSequence).toEqual(['B', 'C'])
  })

  it('keeps B geometry authoritative when a late A measurement arrives', () => {
    const store = new FluidGlassStore(true)
    const elementA = elementStub()
    const elementB = elementStub()
    store.registerTarget('A', elementA, {
      active: true,
      radius: 12,
      shape: 'rounded-rect',
    })
    store.registerTarget('B', elementB, {
      active: false,
      radius: 12,
      shape: 'rounded-rect',
    })
    const targetA = store.targets.get('A')
    const targetB = store.targets.get('B')
    if (targetA) targetA.rect = rect(10, 20)
    if (targetB) targetB.rect = rect(210, 20)
    store.recordSemanticEvent('measurement-complete', 'A', 'initial measurements')
    const lateA = store.registry.beginMeasurement('A')

    store.updateTarget('B', { active: true })
    expect(store.resolvedTarget?.id).toBe('B')
    expect(store.desired.x).toBe(210)

    expect(lateA && store.registry.applyMeasuredRect(lateA, rect(80, 20))).toBe(true)
    expect(store.resolvedTarget?.id).toBe('B')
    expect(store.desired.x).toBe(210)
  })

  it('rejects obsolete measurement and transition generations', () => {
    const scheduler = new RendererScheduler()
    const motion = new LensMotionController(scheduler, true)
    const latest = { ...motion.current, x: 220, y: 30, width: 120, height: 44, opacity: 1 }
    const obsolete = { ...latest, x: 10 }

    expect(motion.retarget(2, 'B', latest, null)).toBe(true)
    expect(motion.retarget(1, 'A', obsolete, null)).toBe(false)
    expect(motion.current.x).toBe(220)

    const store = new FluidGlassStore(true)
    store.registerTarget('A', elementStub(), {
      active: true,
      radius: 12,
      shape: 'rounded-rect',
    })
    const obsoleteMeasurement = store.registry.beginMeasurement('A')
    store.registry.beginMeasurement('A')
    expect(
      obsoleteMeasurement && store.registry.applyMeasuredRect(obsoleteMeasurement, rect(999, 999)),
    ).toBe(false)
  })

  it('synchronizes post-mount active props and unmounts without stale ownership', async () => {
    const store = new FluidGlassStore(true)
    store.registerTarget('A', elementStub(), {
      active: true,
      radius: 12,
      shape: 'rounded-rect',
    })
    store.registerTarget('B', elementStub(), {
      active: false,
      radius: 12,
      shape: 'rounded-rect',
    })

    store.updateTarget(
      'A',
      { active: false },
      { eventType: 'active-prop-change', sourceTargetId: 'A', reason: 'A prop false' },
    )
    store.updateTarget(
      'B',
      { active: true },
      { eventType: 'active-prop-change', sourceTargetId: 'B', reason: 'B prop true' },
    )
    await Promise.resolve()

    expect(store.registry.getActiveTarget('default')?.id).toBe('B')
    expect([...store.targets.values()].filter((target) => target.active)).toHaveLength(1)

    store.unregisterTarget('B')
    expect(store.resolvedTarget).toBeNull()
    expect(store.desired.opacity).toBe(0)
    expect(store.telemetry.getTransitionSnapshot().resolvedRect).toBeNull()
  })

  it('patches behavior and geometry props without replacing the target record', () => {
    const store = new FluidGlassStore(true)
    const element = elementStub()
    store.registerTarget('A', element, {
      active: true,
      behaviors: ['selection', 'hover'],
      radius: 12,
      shape: 'rounded-rect',
    })
    const registered = store.targets.get('A')

    store.updateTarget('A', {
      behaviors: ['selection'],
      disabled: true,
      radius: 20,
      shape: 'capsule',
    })

    expect(store.targets.get('A')).toBe(registered)
    expect(registered).toMatchObject({
      behaviors: ['selection'],
      disabled: true,
      element,
      radius: 20,
      shape: 'capsule',
    })
  })
})

describe('fluid glass fallbacks and geometry', () => {
  const supported = {
    activation: 'always' as const,
    environment: { type: 'theme' as const },
    experimentalRefraction: true,
    forceFallback: false,
    quality: 'auto',
    reducedTransparency: false,
    surfaceStyle: 'glass',
    webgl2: true,
  }

  it('selects SDF or transmission only for a controlled WebGL environment', () => {
    expect(resolveFluidGlassBackend(supported)).toBe('sdf')
    expect(resolveFluidGlassBackend({ ...supported, transmissionPreferred: true })).toBe(
      'transmission',
    )
    expect(resolveFluidGlassBackend({ ...supported, webgl2: false })).toBe('css')
    expect(resolveFluidGlassBackend({ ...supported, reducedTransparency: true })).toBe('css')
    expect(resolveFluidGlassBackend({ ...supported, quality: 'disabled' })).toBe('css')
  })

  it('preserves appearance solid mode before considering GPU support', () => {
    expect(
      resolveFluidGlassBackend({ ...supported, activation: 'appearance', surfaceStyle: 'solid' }),
    ).toBe('css')
  })

  it('converts viewport geometry into group-relative coordinates', () => {
    expect(
      toGroupRelativeRect(
        { left: 160, top: 92, width: 120, height: 44 },
        { left: 40, top: 20 },
        12,
        'rounded-rect',
      ),
    ).toEqual({
      x: 120,
      y: 72,
      width: 120,
      height: 44,
      radius: 12,
      shape: 'rounded-rect',
    })
  })
})
