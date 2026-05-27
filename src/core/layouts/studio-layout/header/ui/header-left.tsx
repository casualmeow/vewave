import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useMatches } from '@tanstack/react-router'

import { Button, Separator } from '@/shared/ui'

export interface HeaderLeftProps {
  sidebarVisible: boolean
  onSidebarVisibilityChange: (visible: boolean) => void
}

export const HeaderLeft = ({ sidebarVisible, onSidebarVisibilityChange }: HeaderLeftProps) => {
  const matches = useMatches()

  const getLastRouteSegment = (): string => {
    const lastMatch = matches[matches.length - 1]
    return lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'Home'
  }

  return (
    <div className="flex gap-4 h-full items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={sidebarVisible ? 'Hide studio navigation' : 'Show studio navigation'}
        aria-pressed={sidebarVisible}
        onClick={() => onSidebarVisibilityChange(!sidebarVisible)}
      >
        {sidebarVisible ? (
          <PanelLeftClose className="size-5" />
        ) : (
          <PanelLeftOpen className="size-5" />
        )}
      </Button>
      <Separator orientation="vertical" />
      <div>{getLastRouteSegment()}</div>
    </div>
  )
}
