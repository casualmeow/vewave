import { ExternalLink, Loader2, PanelRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useOverlayVisibility } from '../hooks/use-overlay-visibility'
import { YouTubePlayer } from '../player'
import { getRoomOverlayStyle } from './room-chrome'
import { RoomControlBar } from './room-control-bar'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import type { RoomConnectionStatus, RoomPreferences } from '../model'
import type { EmbeddedPlayerController, EmbeddedPlayerInfo } from '../player'
import type { PlaybackCommandAction } from '../realtime'
import type {
  GetApiRoomsByCode200Media,
  GetApiRoomsByCode200Playback,
} from '@/core/api/generated/model'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui'

type RoomStageProps = {
  media: GetApiRoomsByCode200Media
  playback: GetApiRoomsByCode200Playback | null
  connectionStatus: RoomConnectionStatus
  canControl: boolean
  sendPlaybackCommand: (action: PlaybackCommandAction, positionMs?: number) => boolean
  playerInfo: EmbeddedPlayerInfo | null
  onPlayerInfo: (info: EmbeddedPlayerInfo) => void
  playerController: RefObject<EmbeddedPlayerController | null>
  preferences: RoomPreferences
  onOpenSettings: () => void
  /** Immersive top-left overlay zone (room identity + sync state). */
  topLeft?: ReactNode
  /**
   * Immersive top-right overlay zone (participants, invite, room menu).
   * Render prop so open menus can hold the overlay visible via
   * `setInteracting`.
   */
  topRight?: (ctx: { setInteracting: (open: boolean) => void }) => ReactNode
  /** Right-edge affordance that opens the room drawer (immersive only). */
  onToggleDrawer?: () => void
  drawerOpen?: boolean
  className?: string
}

/**
 * The video stage shared by both room views. The media fills the available
 * stage viewport (contain by default, optional fill-and-crop), and every
 * piece of chrome is an auto-hiding overlay inside safe zones — the stage
 * itself stays visually open instead of being boxed into cards.
 */
export function RoomStage({
  media,
  playback,
  connectionStatus,
  canControl,
  sendPlaybackCommand,
  playerInfo,
  onPlayerInfo,
  playerController,
  preferences,
  onOpenSettings,
  topLeft,
  topRight,
  onToggleDrawer,
  drawerOpen,
  className,
}: RoomStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playing = playback?.status === 'playing'
  const { visible, poke, setInteracting } = useOverlayVisibility({
    playing,
    delayMs: preferences.overlay.autoHideDelayMs,
  })

  useEffect(() => {
    poke()
  }, [playback?.status, poke])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === stageRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void stageRef.current?.requestFullscreen()
    }
  }

  function togglePlayback() {
    if (canControl && playback) {
      sendPlaybackCommand(playing ? 'pause' : 'play')
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (target.closest('button, a, input, textarea, [role="slider"], [role="menu"]')) {
      return
    }

    switch (event.key) {
      case ' ':
      case 'k':
        event.preventDefault()
        togglePlayback()
        break
      case 'ArrowLeft':
        if (canControl && playback) {
          event.preventDefault()
          sendPlaybackCommand('seek', Math.max(0, playback.effectivePositionMs - 10_000))
        }
        break
      case 'ArrowRight':
        if (canControl && playback) {
          event.preventDefault()
          sendPlaybackCommand('seek', playback.effectivePositionMs + 10_000)
        }
        break
      case 'm': {
        const controller = playerController.current

        if (controller) {
          if (playerInfo?.muted) {
            controller.unmute()
          } else {
            controller.mute()
          }
        }
        break
      }
      case 'f':
        toggleFullscreen()
        break
    }
  }

  const overlayStyle = getRoomOverlayStyle(preferences.overlay)
  const supportsEmbed = media.provider === 'youtube'
  const showLoadingVideo = supportsEmbed && !playerInfo?.ready
  const buffering = playback?.status === 'buffering' || playerInfo?.playerState === 3

  const chromeClass = cn(
    'transition-opacity duration-300 motion-reduce:transition-none',
    visible ? 'opacity-100' : 'pointer-events-none opacity-0',
  )

  return (
    <div
      ref={stageRef}
      data-room-stage
      tabIndex={0}
      className={cn(
        'group relative h-full w-full overflow-hidden bg-media-background outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        !isFullscreen && 'rounded-lg',
        playing && !visible && 'cursor-none',
        className,
      )}
      onPointerMove={poke}
      onPointerDown={poke}
      onTouchStart={poke}
      onFocusCapture={poke}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 [container-type:size]">
        {supportsEmbed ? (
          <div
            className={cn(
              'absolute top-1/2 left-1/2 aspect-video -translate-x-1/2 -translate-y-1/2',
              preferences.stageFit === 'cover'
                ? 'w-[max(100cqw,177.78cqh)]'
                : 'w-[min(100cqw,177.78cqh)]',
            )}
          >
            <YouTubePlayer
              media={media}
              playback={playback}
              onInfo={onPlayerInfo}
              controllerRef={playerController}
            />
          </div>
        ) : (
          <UnsupportedSourceState media={media} />
        )}
      </div>

      {supportsEmbed ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 cursor-default"
          onClick={togglePlayback}
          onDoubleClick={toggleFullscreen}
        />
      ) : null}

      {showLoadingVideo || buffering ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-media-foreground"
            style={overlayStyle}
          >
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            {showLoadingVideo ? 'Loading video…' : 'Buffering…'}
          </span>
        </div>
      ) : null}

      {topLeft ? (
        <div className={cn('absolute top-3 left-3 max-w-[60%]', chromeClass)}>{topLeft}</div>
      ) : null}

      {topRight ? (
        <div className={cn('absolute top-3 right-3', chromeClass)}>
          {topRight({ setInteracting })}
        </div>
      ) : null}

      {onToggleDrawer ? (
        <div className={cn('absolute top-1/2 right-3 -translate-y-1/2', chromeClass)}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-media-foreground hover:bg-media-control hover:text-media-foreground"
            style={overlayStyle}
            aria-label={drawerOpen ? 'Close room panel' : 'Open room panel'}
            aria-expanded={drawerOpen}
            onClick={onToggleDrawer}
          >
            <PanelRight className="size-4" />
          </Button>
        </div>
      ) : null}

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex justify-center px-3 pb-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]',
          chromeClass,
        )}
      >
        <RoomControlBar
          playback={playback}
          canControl={canControl}
          connectionStatus={connectionStatus}
          playerInfo={playerInfo}
          playerController={playerController}
          sendPlaybackCommand={sendPlaybackCommand}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenSettings={onOpenSettings}
          overlayStyle={overlayStyle}
          density={preferences.overlay.density}
          onInteractionChange={setInteracting}
          supportsLocalAudio={supportsEmbed}
        />
      </div>
    </div>
  )
}

function UnsupportedSourceState({ media }: { media: GetApiRoomsByCode200Media }) {
  return (
    <div className="grid h-full w-full place-items-center p-6 text-center">
      <div className="max-w-sm">
        <p className="font-medium text-media-foreground capitalize">
          {media.provider} playback is not supported yet
        </p>
        <p className="mt-2 text-sm text-media-foreground/70">
          Sync still runs through the room protocol. A provider-specific player adapter can be added
          without changing room state.
        </p>
        {media.embedUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-media-foreground underline-offset-4 hover:underline"
            href={media.embedUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open embed
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
    </div>
  )
}
