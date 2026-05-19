import { ExternalLink, Wifi } from 'lucide-react'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import type { RoomConnectionStatus } from '../model'

type RoomHeaderProps = {
  snapshot: GetApiRoomsByCode200
  connectionStatus: RoomConnectionStatus
}

export function RoomHeader({ snapshot, connectionStatus }: RoomHeaderProps) {
  const title = snapshot.room.title ?? snapshot.media.title ?? 'Watch room'

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Room {snapshot.room.code}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="capitalize">{snapshot.media.provider}</span>
          <span>{snapshot.permissions.role}</span>
          <span className="inline-flex items-center gap-1">
            <Wifi className="size-4" />
            {connectionStatus}
          </span>
        </div>
      </div>
      <a
        href={snapshot.media.canonicalUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Source video
        <ExternalLink className="size-4" />
      </a>
    </header>
  )
}
