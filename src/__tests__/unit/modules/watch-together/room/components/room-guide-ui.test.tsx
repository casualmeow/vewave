import { useRef, useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomGuide } from '@/modules/watch-together/room/components/room-guide'

function Example({
  provider = 'youtube',
  canControl = true,
}: {
  provider?: string
  canControl?: boolean
}) {
  const [step, setStep] = useState<number | null>(null)
  const returnFocus = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button ref={returnFocus} onClick={() => setStep(0)}>
        Help
      </button>
      <div data-room-control-bar>Playback</div>
      <button data-room-guide="invite">Invite</button>
      <div data-room-guide="panel">Queue and chat</div>
      <RoomGuide
        step={step}
        onStepChange={setStep}
        onClose={() => setStep(null)}
        returnFocus={returnFocus}
        viewMode="workspace"
        provider={provider}
        canControl={canControl}
      />
    </>
  )
}

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('room guide controls', () => {
  it('explains three real controls, supports Back and Done, and restores focus', async () => {
    render(<Example />)
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined())
    expect(screen.getByText(/Everyone in the room follows the host/)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Bring your people' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Press play, together' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Your queue and conversation' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Help' }))
    expect(document.querySelector('[data-room-guide-highlight]')).toBeNull()
  })

  it('dismisses with Escape and explains viewer permissions without a playback action', async () => {
    render(<Example canControl={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined())
    expect(screen.getByText(/The host controls playback for the room/)).toBeDefined()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps the guide usable on mobile with an unsupported provider and missing target', async () => {
    vi.stubGlobal('innerWidth', 390)
    render(<Example provider="vimeo" />)
    document.querySelector('[data-room-control-bar]')?.removeAttribute('data-room-control-bar')
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined())
    expect(screen.getByText(/This video opens on its own site/)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
