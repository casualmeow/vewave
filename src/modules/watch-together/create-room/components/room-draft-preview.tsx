import { ListVideo, MessageCircle, MonitorPlay } from 'lucide-react'
import { useState } from 'react'
import { RoomWorkspace } from '../../room/components/room-workspace'
import type { DraftVideo } from '../model/video-queue'
import type { RoomPreferences, RoomPreferencesUpdate } from '../../room/model'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export function RoomDraftPreview({
  video,
  videos,
  onSelectVideo,
  title,
  preferences,
  onPreferencesChange,
}: {
  video?: DraftVideo
  videos: Array<DraftVideo>
  onSelectVideo: (id: string) => void
  title: string
  preferences: RoomPreferences
  onPreferencesChange: (update: RoomPreferencesUpdate) => void
}) {
  const [tab, setTab] = useState<'queue' | 'chat'>('queue')
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null)
  const media = video?.media
  const stage = (
    <div className="relative grid h-full min-h-52 w-full place-items-center overflow-hidden rounded-xl bg-media-background text-media-foreground">
      {media?.thumbnailUrl && media.thumbnailUrl !== failedThumbnail ? (
        <img
          src={media.thumbnailUrl}
          alt={media.title ?? 'Selected video preview'}
          className="absolute inset-0 h-full w-full object-contain"
          onError={() => setFailedThumbnail(media.thumbnailUrl ?? null)}
        />
      ) : (
        <div className="max-w-sm px-6 py-10 text-center">
          <MonitorPlay
            aria-hidden="true"
            className="mx-auto mb-5 size-9 text-media-foreground/45"
            strokeWidth={1.25}
          />
          <p className="text-lg font-medium">
            {video?.status === 'loading'
              ? 'Finding your video…'
              : media
                ? (media.title ?? 'Video added')
                : 'What are we watching?'}
          </p>
          <p className="mt-2 text-sm leading-6 text-media-foreground/65">
            {video?.error ??
              (media
                ? 'No thumbnail available. Your video link is ready.'
                : 'Add something to watch below. This space will become your room.')}
          </p>
        </div>
      )}
      {media && (
        <div className="absolute inset-x-0 bottom-0 bg-media-background/85 px-4 py-3 text-xs text-media-foreground">
          {media.provider === 'youtube'
            ? 'Preview only · Playback starts inside the room'
            : `${media.provider} opens on its own site. In-room playback is not available yet.`}
        </div>
      )}
    </div>
  )
  return (
    <section aria-label="Room preview" className="flex min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="truncate text-sm font-medium">{title.trim() || 'Your room'}</h2>
        <span className="shrink-0 text-xs text-muted-foreground">Room preview · Only you</span>
      </div>
      <div className="min-h-64 flex-1 lg:min-h-72">
        {preferences.viewMode === 'workspace' ? (
          <RoomWorkspace
            preferences={preferences}
            updatePreferences={onPreferencesChange}
            stage={stage}
            panel={
              <div className="flex h-full min-h-0 flex-col pl-2">
                <div className="flex gap-1" role="group" aria-label="Preview panel">
                  <Button
                    variant={tab === 'queue' ? 'secondary' : 'ghost'}
                    size="sm"
                    aria-pressed={tab === 'queue'}
                    onClick={() => setTab('queue')}
                  >
                    <ListVideo className="size-4" />
                    Queue
                  </Button>
                  <Button
                    variant={tab === 'chat' ? 'secondary' : 'ghost'}
                    size="sm"
                    aria-pressed={tab === 'chat'}
                    onClick={() => setTab('chat')}
                  >
                    <MessageCircle className="size-4" />
                    Chat
                  </Button>
                </div>
                {tab === 'queue' && videos.length > 0 ? (
                  <ol className="mt-3 min-h-0 space-y-1 overflow-y-auto">
                    {videos.map((item, index) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-label={`Preview queued video ${index + 1}`}
                          aria-pressed={item.id === video?.id}
                          onClick={() => onSelectVideo(item.id)}
                          className={cn(
                            'flex w-full gap-2 rounded-md px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            item.id === video?.id ? 'bg-accent' : 'hover:bg-accent/50',
                          )}
                        >
                          <span className="text-muted-foreground">{index + 1}</span>
                          <span className="truncate">{item.media?.title ?? item.url}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="grid flex-1 content-center gap-2 px-3 py-6 text-sm">
                    <p className="font-medium">
                      {tab === 'queue' ? 'What’s on next' : 'Keep the conversation going'}
                    </p>
                    <p className="leading-6 text-muted-foreground">
                      {tab === 'queue'
                        ? 'Your videos will appear here. Arrange them in the queue below.'
                        : 'Chat with everyone in the room once it opens.'}
                    </p>
                  </div>
                )}
              </div>
            }
          />
        ) : (
          stage
        )}
      </div>
    </section>
  )
}
