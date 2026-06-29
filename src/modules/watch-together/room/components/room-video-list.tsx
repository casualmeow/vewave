import { Plus, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type {
  GetApiRoomsByCode200,
  GetApiRoomsByCode200MediaItemsItem,
} from '@/core/api/generated/model'
import { Button } from '@/shared/ui'

type RoomVideoListProps = {
  snapshot: GetApiRoomsByCode200
  canControl: boolean
  sendMediaAdd: (url: string) => boolean
  sendMediaSelect: (mediaItemId: string) => boolean
}

export function RoomVideoList({
  snapshot,
  canControl,
  sendMediaAdd,
  sendMediaSelect,
}: RoomVideoListProps) {
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const activeItem = getActiveMediaItem(snapshot)

  function addVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextUrl = videoUrl.trim()

    if (!nextUrl) {
      return
    }

    if (!isHttpUrl(nextUrl)) {
      setError('Enter a valid video link.')
      return
    }

    const sent = sendMediaAdd(nextUrl)

    if (!sent) {
      setError('Realtime connection is not open yet.')
      return
    }

    setVideoUrl('')
    setError(null)
  }

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">Video list</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {snapshot.mediaItems.length} video{snapshot.mediaItems.length === 1 ? '' : 's'}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {canControl
            ? 'Add links and choose what everyone watches next.'
            : 'The host controls which video is currently active.'}
        </p>
      </div>

      <form className="mt-4 grid gap-2" onSubmit={addVideo}>
        <input
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canControl}
          placeholder="Paste video link"
          type="url"
          value={videoUrl}
          onChange={(event) => {
            setVideoUrl(event.target.value)
            setError(null)
          }}
        />
        <Button disabled={!canControl || !videoUrl.trim()} type="submit" className="rounded-md">
          <Plus className="size-4" />
          Add video
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </form>

      <div className="mt-4 grid gap-3">
        {snapshot.mediaItems.map((item) => {
          const active = item.id === activeItem?.id

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              className={`h-auto justify-start rounded-lg border p-2 text-left ${
                active ? 'border-primary bg-primary/10' : 'border-border bg-background/40'
              }`}
              disabled={!canControl || active}
              onClick={() => sendMediaSelect(item.id)}
            >
              <VideoListThumbnail item={item} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.title ?? `Video ${item.position + 1}`}
                </span>
                <span className="mt-1 block truncate text-xs font-normal capitalize text-muted-foreground">
                  {active ? 'Now playing' : item.provider}
                </span>
              </span>
            </Button>
          )
        })}
      </div>
    </section>
  )
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function VideoListThumbnail({ item }: { item: GetApiRoomsByCode200MediaItemsItem }) {
  if (item.thumbnailUrl) {
    return (
      <img
        src={item.thumbnailUrl}
        alt=""
        className="aspect-video h-14 shrink-0 rounded-md object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <span className="grid aspect-video h-14 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
      <PlayCircle className="size-5" />
    </span>
  )
}

function getActiveMediaItem(snapshot: GetApiRoomsByCode200) {
  return (
    snapshot.mediaItems.find(
      (item) =>
        item.provider === snapshot.media.provider && item.externalId === snapshot.media.externalId,
    ) ?? snapshot.mediaItems[0]
  )
}
