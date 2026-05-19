import { useRoomRealtime, useRoomSnapshot } from '../hooks'
import { useRoomStore } from '../model'
import { RoomHeader } from './room-header'
import { RoomPlaybackControls } from './room-playback-controls'
import { RoomPresence } from './room-presence'
import { WatchPlayer } from './watch-player'
import { getApiErrorMessage } from '@/core/api/http/errors'

type RoomPageProps = {
  code: string
}

export function RoomPage({ code }: RoomPageProps) {
  const query = useRoomSnapshot(code)
  const { sendPlaybackCommand } = useRoomRealtime(code)
  const snapshot = useRoomStore((state) => state.snapshot) ?? query.data ?? null
  const playback = useRoomStore((state) => state.playback)
  const presence = useRoomStore((state) => state.presence)
  const connectionStatus = useRoomStore((state) => state.connectionStatus)
  const lastError = useRoomStore((state) => state.lastError)

  if (query.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-sm text-muted-foreground">
        Loading room...
      </main>
    )
  }

  if (query.isError || !snapshot) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Room unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {getApiErrorMessage(query.error, 'The room could not be loaded.')}
          </p>
        </div>
      </main>
    )
  }

  const canControl = snapshot.permissions.canControlPlayback

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <RoomHeader snapshot={snapshot} connectionStatus={connectionStatus} />
        {lastError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {lastError}
          </div>
        ) : null}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <WatchPlayer media={snapshot.media} playback={playback ?? snapshot.playback} />
            <RoomPlaybackControls
              canControl={canControl}
              playback={playback ?? snapshot.playback}
              sendPlaybackCommand={sendPlaybackCommand}
            />
          </div>
          <RoomPresence members={presence} />
        </section>
      </div>
    </main>
  )
}
