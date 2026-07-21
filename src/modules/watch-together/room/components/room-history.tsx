import { formatDistanceToNow } from 'date-fns'
import { PlayCircle } from 'lucide-react'
import type { RoomHistoryItem } from '../model'
import { Button } from '@/shared/ui'

type RoomHistoryProps = {
  items: Array<RoomHistoryItem>
  canControl: boolean
  sendMediaSelect: (mediaItemId: string) => boolean
}

export function RoomHistory({ items, canControl, sendMediaSelect }: RoomHistoryProps) {
  return (
    <section aria-label="Watch history" className="flex flex-col gap-1">
      {items.length ? (
        items.map((item) => (
          <Button
            key={`${item.mediaItemId}-${item.playedAt}`}
            type="button"
            variant="ghost"
            className="h-auto justify-start gap-3 rounded-lg p-2 text-left"
            disabled={!canControl}
            onClick={() => sendMediaSelect(item.mediaItemId)}
          >
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt=""
                className="aspect-video h-12 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
            ) : (
              <span className="grid aspect-video h-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <PlayCircle className="size-5" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-foreground/90">
                {item.title ?? `Video ${item.position + 1}`}
              </span>
              <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                {formatDistanceToNow(new Date(item.playedAt), { addSuffix: true })}
                {item.selectedByName ? ` • ${item.selectedByName}` : ''}
              </span>
            </span>
          </Button>
        ))
      ) : (
        <p className="pt-6 text-center text-sm text-muted-foreground">
          Previously played videos will show up here.
        </p>
      )}
    </section>
  )
}
