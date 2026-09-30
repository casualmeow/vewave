import { ArrowDown, ArrowUp, Check, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { createVideoQueue, DraftVideo, VideoQueueSnapshot } from '../model/video-queue'
import { Button, Input, Tooltip } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export function VideoQueueEditor({
  queue,
  draft,
  locked,
}: {
  queue: ReturnType<typeof createVideoQueue>
  draft: VideoQueueSnapshot
  locked: boolean
}) {
  return (
    <section aria-label="Video queue" className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">
          Your queue{' '}
          <span className="ml-1 font-normal text-muted-foreground">{draft.videos.length}/20</span>
        </h2>
        {draft.videos.length > 0 && (
          <span className="text-xs text-muted-foreground">First video opens the room</span>
        )}
      </div>
      {draft.videos.length === 0 ? (
        <p className="py-5 text-sm text-muted-foreground">
          Add one video or paste a few links to plan the night.
        </p>
      ) : (
        <ol className="space-y-1">
          {draft.videos.map((video, index) => (
            <VideoQueueRow
              key={video.id}
              video={video}
              index={index}
              total={draft.videos.length}
              selected={video.id === draft.selectedId}
              locked={locked}
              queue={queue}
            />
          ))}
        </ol>
      )}
      <p role="status" className="mt-2 text-xs text-muted-foreground">
        {draft.message}
      </p>
    </section>
  )
}

function VideoQueueRow({
  video,
  index,
  total,
  selected,
  locked,
  queue,
}: {
  video: DraftVideo
  index: number
  total: number
  selected: boolean
  locked: boolean
  queue: ReturnType<typeof createVideoQueue>
}) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(video.url)
  const label = video.media?.title ?? video.url

  return (
    <li
      className={cn(
        'rounded-lg px-2 py-2 transition-colors motion-reduce:transition-none',
        selected ? 'bg-accent/70' : 'hover:bg-accent/35',
      )}
    >
      {editing ? (
        <form
          className="flex gap-1"
          onSubmit={(event) => {
            event.preventDefault()
            if (queue.edit(video.id, url)) setEditing(false)
          }}
        >
          <Input
            autoFocus
            aria-label={`Edit video ${index + 1} link`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={locked}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Save link"
            disabled={locked}
          >
            <Check />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cancel edit"
            onClick={() => setEditing(false)}
          >
            <X />
          </Button>
        </form>
      ) : (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label={`Preview video ${index + 1}: ${label}`}
            aria-pressed={selected}
            onClick={() => queue.select(video.id)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="w-4 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
              {video.status === 'loading' ? (
                <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
              ) : (
                index + 1
              )}
            </span>
            {video.media?.thumbnailUrl && (
              <img
                src={video.media.thumbnailUrl}
                alt=""
                loading="lazy"
                className="hidden aspect-video w-16 rounded object-cover sm:block"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {video.status === 'loading'
                  ? 'Checking link…'
                  : video.status === 'error'
                    ? 'Needs attention'
                    : video.media?.provider === 'youtube'
                      ? 'YouTube · Plays in the room'
                      : `${video.media?.provider} · Opens externally`}
              </span>
            </span>
          </button>
          <div className="ml-auto flex shrink-0 items-center">
            <Tooltip text="Move earlier" delayDuration={350}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Move video ${index + 1} up`}
                disabled={locked || index === 0}
                onClick={() => queue.move(video.id, -1)}
              >
                <ArrowUp className="size-3.5" />
              </Button>
            </Tooltip>
            <Tooltip text="Move later" delayDuration={350}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Move video ${index + 1} down`}
                disabled={locked || index === total - 1}
                onClick={() => queue.move(video.id, 1)}
              >
                <ArrowDown className="size-3.5" />
              </Button>
            </Tooltip>
            <Tooltip text="Edit link" delayDuration={350}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Edit video ${index + 1}`}
                disabled={locked}
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
            </Tooltip>
            <Tooltip text="Remove video" delayDuration={350}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Remove video ${index + 1}`}
                disabled={locked}
                onClick={() => queue.remove(video.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
      {video.error && (
        <p role="alert" className="mt-2 pl-7 text-xs text-destructive">
          {video.error}
        </p>
      )}
    </li>
  )
}
