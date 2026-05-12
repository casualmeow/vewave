import { PanelRightClose } from 'lucide-react'
import { useMatches } from '@tanstack/react-router'

import { Button, Separator } from '@/shared/ui'

export const HeaderLeft = () => {
  const matches = useMatches()

  const getLastRouteSegment = (): string => {
    const lastMatch = matches[matches.length - 1]
    return lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'Home'
  }

  return (
    <div className="flex gap-4 h-full items-center">
      <Button variant="ghost" size="icon">
        <PanelRightClose className="size-5" />
      </Button>
      <Separator orientation="vertical" />
      <div>{getLastRouteSegment()}</div>
    </div>
  )
}
