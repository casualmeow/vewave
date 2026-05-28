import { PanelRightClose } from 'lucide-react'
import { useMatches } from '@tanstack/react-router'

import { Button, Separator } from '@/shared/ui'

export interface HeaderLeftProps {
  onSidebarVisibilityChange?: () => void
  sidebarVisible?: boolean
}

export const HeaderLeft = ({
  onSidebarVisibilityChange,
  sidebarVisible = true,
}: HeaderLeftProps) => {
  const matches = useMatches()

  const getLastRouteSegment = (): string => {
    const lastMatch = matches[matches.length - 1]
    return lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'Home'
  }

  return (
    <div className="flex h-full items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
        aria-pressed={!sidebarVisible}
        onClick={onSidebarVisibilityChange}
        disabled={!onSidebarVisibilityChange}
      >
        <PanelRightClose className="size-5" />
      </Button>
      <Separator orientation="vertical" className="hidden md:block" />
      <div>{getLastRouteSegment()}</div>
    </div>
  )
}
