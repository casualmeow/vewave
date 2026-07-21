import { Pin, PinOff, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui'

const desktopQuery = '(min-width: 768px)'

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const query = window.matchMedia(desktopQuery)

    setIsDesktop(query.matches)

    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)

    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}

type RoomDrawerProps = {
  open: boolean
  pinned: boolean
  onClose: () => void
  onTogglePinned: () => void
  isDesktop: boolean
  children: ReactNode
}

/**
 * Contextual host for the room panel in immersive view. On desktop it slides
 * in from the right and can overlay the stage or pin beside it; on small
 * screens it becomes a non-modal bottom sheet so playback controls stay
 * reachable. Escape closes the unpinned drawer.
 */
export function RoomDrawer({
  open,
  pinned,
  onClose,
  onTogglePinned,
  isDesktop,
  children,
}: RoomDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || !isDesktop) {
      return
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, isDesktop, onClose])

  if (!isDesktop) {
    return (
      <Sheet modal={false} open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
        <SheetContent
          side="bottom"
          className="h-[62svh] gap-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="pb-0">
            <SheetTitle className="text-sm">Room panel</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 px-4 pt-2">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!open) {
    return null
  }

  return (
    <aside
      ref={panelRef}
      aria-label="Room panel"
      className={cn(
        'z-20 flex h-full w-[min(380px,85vw)] shrink-0 flex-col border-l border-border bg-background',
        pinned ? 'relative' : 'absolute inset-y-0 right-0 shadow-lg',
      )}
    >
      <div className="flex shrink-0 items-center justify-end gap-1 px-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          aria-label={pinned ? 'Unpin panel' : 'Pin panel beside the video'}
          aria-pressed={pinned}
          onClick={onTogglePinned}
        >
          {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          aria-label="Close room panel"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 px-3 pb-3">{children}</div>
    </aside>
  )
}
