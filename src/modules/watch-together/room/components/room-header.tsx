import {
  Copy,
  ExternalLink,
  LayoutPanelLeft,
  MonitorPlay,
  MoreVertical,
  Settings2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { RoomInvite } from './room-invite'
import { RoomSidebarToggle } from './room-sidebar-toggle'
import type { RoomViewMode } from '../model'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { cn } from '@/shared/lib/utils'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'

const mediaChromeButton = 'text-media-foreground hover:bg-media-control hover:text-media-foreground'

type RoomChromeVariant = 'default' | 'media'

export function RoomParticipantsButton({
  count,
  onClick,
  variant = 'default',
}: {
  count: number
  onClick: () => void
  variant?: RoomChromeVariant
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(variant === 'media' ? mediaChromeButton : 'text-muted-foreground')}
      aria-label={`${count} participant${count === 1 ? '' : 's'} — open people panel`}
      onClick={onClick}
    >
      <Users className="size-4" />
      {count}
    </Button>
  )
}

export function RoomMenu({
  snapshot,
  viewMode,
  onViewModeChange,
  onOpenSettings,
  variant = 'default',
  onOpenChange,
}: {
  snapshot: GetApiRoomsByCode200
  viewMode: RoomViewMode
  onViewModeChange: (mode: RoomViewMode) => void
  onOpenSettings: () => void
  variant?: RoomChromeVariant
  onOpenChange?: (open: boolean) => void
}) {
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(snapshot.room.code)
      toast.success('Room code copied')
    } catch {
      toast.error('Unable to copy room code')
    }
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'size-8',
            variant === 'media' ? mediaChromeButton : 'text-muted-foreground',
          )}
          aria-label="Room menu"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {viewMode === 'immersive' ? (
          <DropdownMenuItem onClick={() => onViewModeChange('workspace')}>
            <LayoutPanelLeft className="size-4" />
            Switch to Workspace view
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onViewModeChange('immersive')}>
            <MonitorPlay className="size-4" />
            Switch to Immersive view
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onOpenSettings}>
          <Settings2 className="size-4" />
          Room settings…
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void copyCode()}>
          <Copy className="size-4" />
          Copy room code
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={snapshot.media.canonicalUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Source video
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type RoomHeaderProps = {
  snapshot: GetApiRoomsByCode200
  participantCount: number
  viewMode: RoomViewMode
  onViewModeChange: (mode: RoomViewMode) => void
  onOpenSettings: () => void
  onOpenPeople: () => void
}

/**
 * Permanent room header reduced to essentials: identity, participants, one
 * Invite action, and an overflow menu. Secondary metadata lives in settings.
 */
export function RoomHeader({
  snapshot,
  participantCount,
  viewMode,
  onViewModeChange,
  onOpenSettings,
  onOpenPeople,
}: RoomHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 px-1">
      <RoomSidebarToggle />
      <div className="flex shrink-0 items-center gap-1.5">
        <RoomParticipantsButton count={participantCount} onClick={onOpenPeople} />
        <RoomInvite snapshot={snapshot} />
        <RoomMenu
          snapshot={snapshot}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onOpenSettings={onOpenSettings}
        />
      </div>
    </header>
  )
}
