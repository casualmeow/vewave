import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { GetApiRoomsByCode200Playback } from '@/core/api/generated/model'
import type { PlaybackCommandAction } from '../realtime'
import { Button, Input } from '@/shared/ui'

type RoomPlaybackControlsProps = {
  playback: GetApiRoomsByCode200Playback | null
  canControl: boolean
  sendPlaybackCommand: (action: PlaybackCommandAction, positionMs?: number) => boolean
}

export function RoomPlaybackControls({
  playback,
  canControl,
  sendPlaybackCommand,
}: RoomPlaybackControlsProps) {
  const [seekSeconds, setSeekSeconds] = useState(0)

  useEffect(() => {
    if (playback) {
      setSeekSeconds(Math.round(playback.effectivePositionMs / 1000))
    }
  }, [playback])

  const disabled = !canControl

  function send(action: PlaybackCommandAction, positionMs?: number) {
    const sent = sendPlaybackCommand(action, positionMs)

    if (!sent) {
      return
    }
  }

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium">Playback controls</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {canControl
              ? 'Host controls send server-authoritative playback commands.'
              : 'Only the room owner or host can control playback.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={disabled} type="button" onClick={() => send('play')}>
            <Play className="size-4" />
            Play
          </Button>
          <Button disabled={disabled} variant="outline" type="button" onClick={() => send('pause')}>
            <Pause className="size-4" />
            Pause
          </Button>
          <div className="flex min-w-44 items-center gap-2">
            <Input
              aria-label="Seek position in seconds"
              disabled={disabled}
              min={0}
              type="number"
              value={seekSeconds}
              onChange={(event) => setSeekSeconds(Number(event.target.value))}
            />
            <Button
              disabled={disabled}
              variant="outline"
              type="button"
              onClick={() => send('seek', seekSeconds * 1000)}
            >
              <RotateCcw className="size-4" />
              Seek
            </Button>
          </div>
        </div>
        {playback ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{playback.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Position</dt>
              <dd>{Math.round(playback.effectivePositionMs / 1000)}s</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd>{playback.version}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  )
}
