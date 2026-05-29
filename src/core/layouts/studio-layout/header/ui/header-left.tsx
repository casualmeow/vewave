import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useMatches } from '@tanstack/react-router'

import { useStudioSidebar } from '@/components/sidebar'
import { Button, Separator } from '@/shared/ui'

export const HeaderLeft = () => {
  const matches = useMatches()
  const { desktopOpen, toggleDesktop } = useStudioSidebar()

  const getLastRouteSegment = (): string => {
    const lastMatch = matches[matches.length - 1]
    return lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'Home'
  }

  return (
    <div className="flex h-full items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        aria-label={desktopOpen ? 'Hide studio sidebar' : 'Show studio sidebar'}
        aria-pressed={desktopOpen}
        onClick={toggleDesktop}
      >
        {desktopOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
      </Button>

      <Separator orientation="vertical" />
      <div className="font-medium capitalize">{getLastRouteSegment()}</div>
    </div>
  )
}
