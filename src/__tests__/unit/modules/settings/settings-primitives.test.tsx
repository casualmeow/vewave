import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SegmentedControl } from '@/modules/settings/settings-primitives'

const options = [
  { label: 'Off', value: 'off' },
  { label: 'Subtle', value: 'subtle' },
  { label: 'Fluid', value: 'fluid' },
] as const

let reducedTransparency = false

function Controls() {
  const [value, setValue] = useState<'off' | 'subtle' | 'fluid'>('subtle')
  return (
    <SegmentedControl
      ariaLabel="Glass motion"
      options={options}
      value={value}
      onChange={setValue}
    />
  )
}

beforeEach(() => {
  reducedTransparency = false
  document.documentElement.dataset.surfaceStyle = 'glass'
  document.documentElement.dataset.glassMotion = 'fluid'
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-transparency') && reducedTransparency,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  cleanup()
  delete document.documentElement.dataset.surfaceStyle
  delete document.documentElement.dataset.glassMotion
  vi.unstubAllGlobals()
})

describe('settings segmented selection', () => {
  it('shares one DOM lens while keeping native button selection authoritative', () => {
    const { container } = render(<Controls />)
    const group = screen.getByRole('group', { name: 'Glass motion' })
    const controls = within(group)

    expect(container.querySelectorAll('[data-fluid-glass-group]')).toHaveLength(1)
    expect(group.querySelectorAll('button[data-fluid-glass-target]')).toHaveLength(3)
    expect(container.querySelector('canvas')).toBeNull()
    expect(controls.getByRole('button', { name: 'Subtle' }).getAttribute('aria-pressed')).toBe(
      'true',
    )

    fireEvent.pointerEnter(controls.getByRole('button', { name: 'Fluid' }))
    expect(controls.getByRole('button', { name: 'Subtle' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    fireEvent.click(controls.getByRole('button', { name: 'Fluid' }))
    expect(controls.getByRole('button', { name: 'Fluid' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(group.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1)
  })

  it('keeps focus and selection separate until a keyboard click commits the choice', () => {
    render(<Controls />)
    const off = screen.getByRole('button', { name: 'Off' })

    act(() => off.focus())
    expect(document.activeElement).toBe(off)
    expect(off.tabIndex).toBe(0)
    expect(off.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(off, { detail: 0 })
    expect(off.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(off)
  })

  it.each(['solid', 'reduced transparency'])('retains selected controls with %s', (fallback) => {
    document.documentElement.dataset.surfaceStyle = fallback === 'solid' ? 'solid' : 'glass'
    reducedTransparency = fallback === 'reduced transparency'
    const { container } = render(<Controls />)

    expect(
      container
        .querySelector('[data-fluid-glass-resolved-backend]')
        ?.getAttribute('data-fluid-glass-resolved-backend'),
    ).toBe('solid')
    fireEvent.click(screen.getByRole('button', { name: 'Off' }))
    expect(screen.getByRole('button', { name: 'Off' }).getAttribute('aria-pressed')).toBe('true')
  })
})
