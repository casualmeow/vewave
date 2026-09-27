import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GlassInteractionEvent } from '@/shared/lib/glass-interaction'
import { createGlassInteractionRegistry } from '@/shared/lib/glass-interaction-scope'

const event: GlassInteractionEvent = { phase: 'move', input: 'mouse', x: 3, y: 20, time: 0 }
const nodes: Array<HTMLElement> = []
function surface(parent: HTMLElement = document.body) {
  const node = document.createElement('div')
  parent.append(node)
  nodes.push(node)
  return node
}
afterEach(() => nodes.splice(0).forEach((node) => node.remove()))

describe('product glass input routing', () => {
  it('routes nested targets to the topmost surface and reaches portalled content', () => {
    const registry = createGlassInteractionRegistry()
    const shell = surface()
    const child = surface(shell)
    const portal = surface()
    const shellReceive = vi.fn()
    const childReceive = vi.fn()
    const portalReceive = vi.fn()
    registry.register(shell, shellReceive)
    registry.register(child, childReceive)
    registry.register(portal, portalReceive)
    registry.dispatch(event, [child, shell, document.body])
    expect(childReceive).toHaveBeenLastCalledWith(event)
    expect(shellReceive).not.toHaveBeenCalled()
    registry.dispatch(event, [portal, document.body])
    expect(childReceive).toHaveBeenLastCalledWith({ ...event, phase: 'exit' })
    expect(portalReceive).toHaveBeenLastCalledWith(event)
    expect(shellReceive).not.toHaveBeenCalled()
  })

  it('allows scene/native subscribers on one node, and unregisters them independently', () => {
    const registry = createGlassInteractionRegistry()
    const node = surface()
    const first = vi.fn()
    const second = vi.fn()
    const remove = registry.register(node, first)
    registry.register(node, second)
    registry.dispatch(event, [node])
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    remove()
    expect(first).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'reset' }))
    registry.dispatch(event, [node])
    expect(first).toHaveBeenCalledTimes(2)
    expect(second).toHaveBeenCalledTimes(2)
  })

  it('keeps only the active surface and one settling surface alive', () => {
    const registry = createGlassInteractionRegistry()
    const panes = [surface(), surface(), surface()]
    const receivers = panes.map((pane) => {
      const receive = vi.fn()
      registry.register(pane, receive)
      return receive
    })
    panes.forEach((pane) => registry.dispatch(event, [pane]))
    expect(receivers[0]).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'reset' }))
    expect(receivers[1]).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'exit' }))
    expect(receivers[2]).toHaveBeenLastCalledWith(event)
  })

  it('does not disturb glass while editing or when a modal overlay blocks the pane', () => {
    const registry = createGlassInteractionRegistry()
    const shell = surface()
    const receive = vi.fn()
    registry.register(shell, receive)
    const input = document.createElement('input')
    shell.append(input)
    registry.dispatch({ ...event, phase: 'press' }, [input, shell])
    expect(receive).not.toHaveBeenCalled()
    registry.dispatch(event, [shell])
    registry.dispatch(event, [surface(), document.body])
    expect(receive).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'exit' }))
  })

  it('resets all adapters on keyboard/cancellation and ignores inert surfaces', () => {
    const registry = createGlassInteractionRegistry()
    const node = surface()
    const receive = vi.fn()
    registry.register(node, receive)
    registry.dispatch(event, [node])
    registry.dispatch({ ...event, input: 'keyboard' }, [node])
    expect(receive).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'reset' }))
    receive.mockClear()
    node.setAttribute('inert', '')
    registry.dispatch(event, [node])
    expect(receive).not.toHaveBeenCalled()
  })
})
