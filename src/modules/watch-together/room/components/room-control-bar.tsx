import { Maximize, Minimize, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { usePlaybackPosition } from '../hooks/use-playback-position'
import { formatPlaybackTime } from './room-chrome'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { RoomConnectionStatus, RoomOverlayDensity } from '../model'
import type { EmbeddedPlayerController, EmbeddedPlayerInfo } from '../player'
import type { PlaybackCommandAction } from '../realtime'
import type { GetApiRoomsByCode200Playback } from '@/core/api/generated/model'
import { cn } from '@/shared/lib/utils'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Slider,
  Tooltip,
} from '@/shared/ui'

type RoomControlBarProps = {
  playback: GetApiRoomsByCode200Playback | null
  canControl: boolean
  connectionStatus: RoomConnectionStatus
  playerInfo: EmbeddedPlayerInfo | null
  playerController: RefObject<EmbeddedPlayerController | null>
  sendPlaybackCommand: (action: PlaybackCommandAction, positionMs?: number) => boolean
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onOpenSettings: () => void
  overlayStyle: CSSProperties
  density: RoomOverlayDensity
  /** Reports open menus so overlay auto-hide pauses while one is open. */
  onInteractionChange: (open: boolean) => void
  /** Local audio commands only work for embedded providers. */
  supportsLocalAudio: boolean
}

const hostOnlyHint = 'Only the room owner or a host can control shared playback.'

/**
 * The single playback-control system for a room. Renders over the stage,
 * distinguishes host commands from local-only controls, and keeps read-only
 * participants informed instead of surprising them with dead buttons.
 */
export function RoomControlBar({
  playback,
  canControl,
  connectionStatus,
  playerInfo,
  playerController,
  sendPlaybackCommand,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  overlayStyle,
  density,
  onInteractionChange,
  supportsLocalAudio,
}: RoomControlBarProps) {
  const livePositionMs = usePlaybackPosition(playback)
  const [scrubMs, setScrubMs] = useState<number | null>(null)

  const playerPositionMs = playerInfo?.ready ? playerInfo.currentTimeMs : null
  const positionMs = scrubMs ?? playerPositionMs ?? livePositionMs
  const durationMs = playerInfo?.durationMs ?? null
  const playing = playback?.status === 'playing'
  const driftMs = playing && playerPositionMs !== null ? playerPositionMs - livePositionMs : null

  const iconButton = density === 'comfortable' ? 'size-11' : 'size-9'
  const mediaButton = cn(
    iconButton,
    'text-media-foreground hover:bg-media-control hover:text-media-foreground',
  )

  const muted = playerInfo?.muted ?? false
  const volume = playerInfo?.volume ?? 100

  function togglePlayback() {
    if (!playback) {
      return
    }

    sendPlaybackCommand(playing ? 'pause' : 'play')
  }

  function commitSeek(valueMs: number) {
    setScrubMs(null)
    sendPlaybackCommand('seek', Math.max(0, Math.round(valueMs)))
  }

  function toggleMute() {
    const controller = playerController.current

    if (!controller) {
      return
    }

    if (muted) {
      controller.unmute()
    } else {
      controller.mute()
    }
  }

  return (
    <div
      data-room-control-bar
      className={cn('pointer-events-auto w-full', density === 'comfortable' ? 'p-3' : 'p-2')}
      style={overlayStyle}
    >
      <HostGate allowed={canControl} className="block w-full">
        <Slider
          aria-label="Seek timeline"
          disabled={!canControl}
          value={[Math.min(positionMs, durationMs ?? Number.MAX_SAFE_INTEGER)]}
          min={0}
          max={durationMs ?? Math.max(positionMs, 1)}
          step={500}
          onValueChange={([value]) => {
            if (canControl) {
              setScrubMs(value)
            }
          }}
          onValueCommit={([value]) => {
            if (canControl) {
              commitSeek(value)
            }
          }}
          className="px-1 py-1 [&_[data-slot=slider-range]]:bg-media-foreground [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-media-foreground [&_[data-slot=slider-track]]:bg-media-muted"
        />
      </HostGate>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <HostGate allowed={canControl}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={mediaButton}
              disabled={!canControl}
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={togglePlayback}
            >
              {playing ? (
                <Pause className="size-4 fill-media-foreground" />
              ) : (
                <Play className="size-4 fill-media-foreground" />
              )}
            </Button>
          </HostGate>
          {supportsLocalAudio ? (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={mediaButton}
                aria-label={muted ? 'Unmute' : 'Mute'}
                onClick={toggleMute}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </Button>
              <Slider
                aria-label="Volume"
                value={[muted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => playerController.current?.setVolume(value)}
                className="hidden w-20 sm:flex [&_[data-slot=slider-range]]:bg-media-foreground [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-media-foreground [&_[data-slot=slider-track]]:bg-media-muted"
              />
            </div>
          ) : null}
          <span className="ml-1 truncate font-mono text-xs text-media-foreground/90">
            {formatPlaybackTime(positionMs)} / {formatPlaybackTime(durationMs)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {!canControl ? (
            <span className="hidden text-xs text-media-foreground/60 md:inline">View only</span>
          ) : null}
          <DropdownMenu onOpenChange={onInteractionChange}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={mediaButton}
                aria-label="Playback settings"
              >
                <Settings className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent disablePortal align="end" className="w-64">
              <DropdownMenuLabel>Playback</DropdownMenuLabel>
              <DropdownMenuItem onClick={onOpenSettings}>
                Room settings and appearance…
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Diagnostics
              </DropdownMenuLabel>
              <div className="space-y-1 px-2 pb-2 font-mono text-xs text-muted-foreground">
                <DiagnosticRow label="State" value={playback?.status ?? 'unknown'} />
                <DiagnosticRow
                  label="Synced position"
                  value={formatPlaybackTime(playback?.effectivePositionMs)}
                />
                <DiagnosticRow label="Version" value={String(playback?.version ?? '—')} />
                <DiagnosticRow label="Connection" value={connectionStatus} />
                <DiagnosticRow
                  label="Drift"
                  value={driftMs === null ? '—' : `${Math.round(driftMs)}ms`}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={mediaButton}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="truncate text-foreground/80">{value}</span>
    </p>
  )
}

/** Wraps host-only controls so read-only participants learn why they are off. */
function HostGate({
  allowed,
  children,
  className,
}: {
  allowed: boolean
  children: ReactNode
  className?: string
}) {
  if (allowed) {
    return children
  }

  return (
    <Tooltip text={hostOnlyHint}>
      <span className={cn('inline-flex', className)}>{children}</span>
    </Tooltip>
  )
}
