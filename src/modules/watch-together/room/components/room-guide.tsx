import { useEffect, useRef, useState } from 'react'
import { Popover } from 'radix-ui'
import { X } from 'lucide-react'
import type { RefObject } from 'react'
import { Button, GlassSurface } from '@/shared/ui'
import './room-guide.css'

const selectors = [
  '[data-room-control-bar], [data-room-stage]',
  '[data-room-guide="invite"]',
  '[data-room-guide="panel"]',
]
const titles = ['Press play, together', 'Bring your people', 'Your queue and conversation']

type RoomGuideProps = {
  step: number | null
  onStepChange: (step: number) => void
  onClose: (status?: 'completed' | 'dismissed') => void
  returnFocus: RefObject<HTMLElement | null>
  viewMode: string
  canControl: boolean
  provider: string
}

export function RoomGuide({
  step,
  onStepChange,
  onClose,
  returnFocus,
  viewMode,
  canControl,
  provider,
}: RoomGuideProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [mobile, setMobile] = useState(false)
  const [portal, setPortal] = useState<Element | undefined>(undefined)
  const open = step !== null
  const index = step ?? 0

  useEffect(() => {
    if (step === null) return
    let target: HTMLElement | null = null
    function measure() {
      setMobile(window.innerWidth < 768)
      setPortal(document.fullscreenElement ?? undefined)
      const next =
        step === 0
          ? (document.querySelector<HTMLElement>('[data-room-control-bar]') ??
            document.querySelector<HTMLElement>('[data-room-stage]'))
          : document.querySelector<HTMLElement>(selectors[step ?? 0])
      if (target !== next) target?.removeAttribute('data-room-guide-highlight')
      target = next
      target?.setAttribute('data-room-guide-highlight', '')
      setAnchor(target)
    }
    const frame = requestAnimationFrame(() => {
      measure()
      heading.current?.focus()
    })
    window.addEventListener('resize', measure)
    document.addEventListener('fullscreenchange', measure)
    return () => {
      cancelAnimationFrame(frame)
      target?.removeAttribute('data-room-guide-highlight')
      window.removeEventListener('resize', measure)
      document.removeEventListener('fullscreenchange', measure)
    }
  }, [step, viewMode])

  const description =
    index === 0
      ? provider !== 'youtube'
        ? 'This video opens on its own site. Choose a YouTube video for playback together inside Vewave.'
        : canControl
          ? 'Play, pause, or seek here. Everyone in the room follows the host. Volume is just for you.'
          : 'The host controls playback for the room. Your volume and viewing layout are yours to change.'
      : index === 1
        ? 'Open Invite to copy your room link or share its QR code. Your friends can sign in and join you.'
        : 'Queue holds the videos for your room. Switch to Chat to talk while you watch. Hosts can add and choose videos.'

  return (
    <Popover.Root
      open={open}
      modal={false}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Popover.Anchor
        virtualRef={{
          current: {
            getBoundingClientRect: () =>
              !mobile && anchor
                ? anchor.getBoundingClientRect()
                : new DOMRect(window.innerWidth / 2, window.innerHeight - 16, 0, 0),
          },
        }}
      />
      <Popover.Portal container={portal}>
        <GlassSurface
          asChild
          role="menu"
          elevation="floating"
          thickness="regular"
          presence="popover"
        >
          <Popover.Content
            side={mobile || !anchor ? 'top' : 'left'}
            align="center"
            sideOffset={16}
            collisionPadding={16}
            aria-labelledby="room-guide-heading"
            aria-describedby="room-guide-description"
            className="z-[80] w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-5 shadow-lg"
            onInteractOutside={(event) => event.preventDefault()}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              heading.current?.focus()
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              const target = returnFocus.current
              if (target?.isConnected && target !== document.body) target.focus()
              else
                document
                  .querySelector<HTMLElement>('[data-room-guide-help], [data-room-stage]')
                  ?.focus()
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Room guide · {index + 1} of 3</span>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 size-8"
                aria-label="Close room guide"
                onClick={() => onClose()}
              >
                <X className="size-4" />
              </Button>
            </div>
            <h2
              id="room-guide-heading"
              ref={heading}
              tabIndex={-1}
              className="text-base font-semibold outline-none"
            >
              {titles[index]}
            </h2>
            <p id="room-guide-description" className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onClose()}>
                Skip
              </Button>
              <div className="ml-auto flex gap-2">
                {index > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => onStepChange(index - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => (index === 2 ? onClose('completed') : onStepChange(index + 1))}
                >
                  {index === 2 ? 'Done' : 'Next'}
                </Button>
              </div>
            </div>
          </Popover.Content>
        </GlassSurface>
      </Popover.Portal>
    </Popover.Root>
  )
}
