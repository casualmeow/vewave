import { YouTubePlayer } from '../player'
import type {
  GetApiRoomsByCode200Media,
  GetApiRoomsByCode200Playback,
} from '@/core/api/generated/model'

type WatchPlayerProps = {
  media: GetApiRoomsByCode200Media
  playback: GetApiRoomsByCode200Playback | null
}

export function WatchPlayer({ media, playback }: WatchPlayerProps) {
  if (media.provider === 'youtube') {
    return <YouTubePlayer media={media} playback={playback} />
  }

  return (
    <div className="grid aspect-video w-full place-items-center rounded-xl border bg-muted/40 p-6 text-center">
      <div>
        <p className="font-medium capitalize">{media.provider} playback preview</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sync controls are wired through the room protocol. A provider-specific player adapter can
          be added here without changing room state.
        </p>
        {media.embedUrl ? (
          <a
            className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={media.embedUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open embed
          </a>
        ) : null}
      </div>
    </div>
  )
}
