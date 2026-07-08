import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { unpinRoom } from '../../app-sidebar-pins'
import {
  SettingsEmptyHint,
  SettingsGroup,
  SettingsItemRow,
  SettingRow,
} from './settings-primitives'
import { useAuthStore } from '@/modules/auth'
import { forgetSavedRoom, readSavedRooms, useSavedRooms } from '@/modules/watch-together/room'
import { Button, DialogClose } from '@/shared/ui'

export function HistorySettingsSection() {
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null
  const rooms = useSavedRooms(userId)

  const handleForgetRoom = (code: string) => {
    forgetSavedRoom(userId, code)
    unpinRoom(userId, code)
    toast.success('Room removed from history')
  }

  const handleClearHistory = () => {
    readSavedRooms(userId).forEach((room) => {
      forgetSavedRoom(userId, room.code)
      unpinRoom(userId, room.code)
    })
    toast.success('Watch history cleared')
  }

  return (
    <div className="grid gap-6">
      <SettingsGroup title={`Recent rooms (${rooms.length})`}>
        {rooms.length === 0 ? (
          <SettingsEmptyHint>
            No rooms remembered yet. Rooms you create or join appear here and in the sidebar.
          </SettingsEmptyHint>
        ) : (
          <ul className="grid gap-2">
            {rooms.map((room) => (
              <SettingsItemRow
                key={room.code}
                title={
                  <DialogClose asChild>
                    <Link
                      to="/room/$code"
                      params={{ code: room.code }}
                      className="outline-none hover:underline focus-visible:underline"
                    >
                      {room.title}
                    </Link>
                  </DialogClose>
                }
                meta={[
                  `Code ${room.code}`,
                  formatLastOpened(room.lastOpenedAt),
                  room.status === 'active' ? 'Live' : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${room.title} from history`}
                    onClick={() => handleForgetRoom(room.code)}
                  >
                    <X className="size-4" />
                  </Button>
                }
              />
            ))}
          </ul>
        )}
      </SettingsGroup>

      <SettingsGroup title="Retention">
        <SettingRow
          title="Clear watch history"
          description="History is stored only on this device. Clearing it also removes room pins that point at it."
          control={
            <Button
              variant="outline"
              size="sm"
              disabled={rooms.length === 0}
              onClick={handleClearHistory}
            >
              Clear history
            </Button>
          }
        />
      </SettingsGroup>
    </div>
  )
}

function formatLastOpened(value: string) {
  const timestamp = Date.parse(value)

  if (!Number.isFinite(timestamp)) {
    return 'Opened recently'
  }

  const diffMs = Date.now() - timestamp
  const minuteMs = 60_000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs < minuteMs) return 'Opened just now'
  if (diffMs < hourMs) return `Opened ${Math.max(1, Math.floor(diffMs / minuteMs))} min ago`
  if (diffMs < dayMs) return `Opened ${Math.max(1, Math.floor(diffMs / hourMs))} hr ago`
  if (diffMs < 7 * dayMs) {
    const days = Math.max(1, Math.floor(diffMs / dayMs))

    return `Opened ${days} day${days === 1 ? '' : 's'} ago`
  }

  return `Opened ${new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(new Date(timestamp))}`
}
