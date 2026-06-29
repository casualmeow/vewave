import { ExternalLink, Share2, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import type { RoomConnectionStatus } from '../model'
import { Button } from '@/shared/ui'

type RoomHeaderProps = {
  snapshot: GetApiRoomsByCode200
  connectionStatus: RoomConnectionStatus
}

export function RoomHeader({ snapshot, connectionStatus }: RoomHeaderProps) {
  const title = snapshot.room.title ?? snapshot.media.title ?? 'Room'

  async function shareRoomLink() {
    if (typeof window === 'undefined') {
      return
    }

    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Join room ${snapshot.room.code} on Vewave.`,
          url,
        })
        toast.success('Room link shared')
        return
      }

      await navigator.clipboard.writeText(url)
      toast.success('Room link copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      toast.error('Unable to share room link')
    }
  }

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Room {snapshot.room.code}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="capitalize">{snapshot.media.provider}</span>
          <span>
            {snapshot.mediaItems.length} video{snapshot.mediaItems.length === 1 ? '' : 's'}
          </span>
          <span>{snapshot.permissions.role}</span>
          <span className="inline-flex items-center gap-1">
            <Wifi className="size-4" />
            {connectionStatus}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          onClick={() => void shareRoomLink()}
        >
          <Share2 className="size-4" />
          Share room
        </Button>
        <a
          href={snapshot.media.canonicalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Source video
          <ExternalLink className="size-4" />
        </a>
      </div>
    </header>
  )
}
