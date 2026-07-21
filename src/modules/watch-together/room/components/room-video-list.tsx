import {
  Check,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Play,
  PlayCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { FormEvent } from 'react'
import type {
  GetApiRoomsByCode200,
  GetApiRoomsByCode200MediaItemsItem,
} from '@/core/api/generated/model'
import { cn } from '@/shared/lib/utils'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@/shared/ui'

type RoomVideoListProps = {
  snapshot: GetApiRoomsByCode200
  canControl: boolean
  canAddMedia: boolean
  sendMediaAdd: (url: string) => boolean
  sendMediaRemove: (mediaItemId: string) => boolean
  sendMediaRename: (mediaItemId: string, title: string) => boolean
  sendMediaSelect: (mediaItemId: string) => boolean
}

/**
 * The room queue. Hierarchy comes from surface emphasis and spacing —
 * the active item gets a background, upcoming items stay flat rows —
 * instead of wrapping every entry in another bordered card.
 */
export function RoomVideoList({
  snapshot,
  canControl,
  canAddMedia,
  sendMediaAdd,
  sendMediaRemove,
  sendMediaRename,
  sendMediaSelect,
}: RoomVideoListProps) {
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
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

  function startRenaming(item: GetApiRoomsByCode200MediaItemsItem) {
    setEditingItemId(item.id)
    setDraftTitle(item.title ?? `Video ${item.position + 1}`)
    setError(null)
  }

  function cancelRenaming() {
    setEditingItemId(null)
    setDraftTitle('')
  }

  function renameVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingItemId) return

    const title = draftTitle.trim()
    if (!title) {
      setError('Video name cannot be empty.')
      return
    }

    if (!sendMediaRename(editingItemId, title)) {
      setError('Realtime connection is not open yet.')
      return
    }

    cancelRenaming()
    setError(null)
  }

  function removeVideo(mediaItemId: string) {
    if (!sendMediaRemove(mediaItemId)) {
      setError('Realtime connection is not open yet.')
      return
    }

    setError(null)
  }

  return (
    <section aria-label="Queue" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-medium">Queue</h2>
        <span className="text-xs text-muted-foreground">
          {snapshot.mediaItems.length} video{snapshot.mediaItems.length === 1 ? '' : 's'}
        </span>
      </div>

      {canAddMedia ? (
        <form className="flex items-center gap-2" onSubmit={addVideo}>
          <Input
            aria-label="Video link"
            placeholder="Paste video link"
            type="url"
            value={videoUrl}
            onChange={(event) => {
              setVideoUrl(event.target.value)
              setError(null)
            }}
          />
          <Button
            disabled={!videoUrl.trim()}
            type="submit"
            size="icon"
            className="shrink-0"
            aria-label="Add video"
            title="Add video"
          >
            <Plus className="size-4" />
          </Button>
        </form>
      ) : (
        <p className="px-1 text-xs text-muted-foreground">
          The host controls which video is currently active.
        </p>
      )}
      {error ? <p className="px-1 text-xs text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-1">
        {snapshot.mediaItems.map((item) => {
          const active = item.id === activeItem?.id
          const editing = item.id === editingItemId

          return (
            <div
              key={item.id}
              className={cn(
                'group/queue-item flex items-center gap-1 rounded-lg pr-1',
                active ? 'bg-accent' : 'hover:bg-muted/50',
              )}
            >
              {editing ? (
                <form className="flex min-w-0 flex-1 items-center gap-2 p-2" onSubmit={renameVideo}>
                  <VideoListThumbnail item={item} />
                  <Input
                    autoFocus
                    aria-label="Video name"
                    className="h-8 min-w-0"
                    maxLength={180}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="Save video name"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground"
                    aria-label="Cancel rename"
                    onClick={cancelRenaming}
                  >
                    <X className="size-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto min-w-0 flex-1 justify-start gap-3 p-2 text-left hover:bg-transparent dark:hover:bg-transparent"
                    disabled={!canControl || active}
                    onClick={() => sendMediaSelect(item.id)}
                  >
                    <VideoListThumbnail item={item} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-sm',
                          active ? 'font-medium text-foreground' : 'text-foreground/90',
                        )}
                      >
                        {item.title ?? `Video ${item.position + 1}`}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                        {active ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Play className="size-3 fill-current" />
                            Now playing
                          </span>
                        ) : (
                          <span className="capitalize">{item.provider}</span>
                        )}
                      </span>
                    </span>
                  </Button>
                  <QueueItemMenu
                    item={item}
                    canControl={canControl}
                    canManage={canAddMedia}
                    canRemove={snapshot.mediaItems.length > 1}
                    active={active}
                    onPlay={() => sendMediaSelect(item.id)}
                    onRename={() => startRenaming(item)}
                    onRemove={() => removeVideo(item.id)}
                  />
                </>
              )}
            </div>
          )
        })}
        {snapshot.mediaItems.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            The queue is empty.{canAddMedia ? ' Paste a link above to add the first video.' : ''}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function QueueItemMenu({
  item,
  canControl,
  canManage,
  canRemove,
  active,
  onPlay,
  onRename,
  onRemove,
}: {
  item: GetApiRoomsByCode200MediaItemsItem
  canControl: boolean
  canManage: boolean
  canRemove: boolean
  active: boolean
  onPlay: () => void
  onRename: () => void
  onRemove: () => void
}) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.canonicalUrl)
      toast.success('Video link copied')
    } catch {
      toast.error('Unable to copy link')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/queue-item:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 motion-reduce:transition-none"
          aria-label="Video actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canControl && !active ? (
          <DropdownMenuItem onClick={onPlay}>
            <Play className="size-4" />
            Play now
          </DropdownMenuItem>
        ) : null}
        {canManage ? (
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={() => void copyLink()}>
          <Copy className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Open source
          </a>
        </DropdownMenuItem>
        {canManage ? (
          <DropdownMenuItem variant="destructive" disabled={!canRemove} onClick={onRemove}>
            <Trash2 className="size-4" />
            Remove from queue
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
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
        className="aspect-video h-12 shrink-0 rounded-md object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <span className="grid aspect-video h-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
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
