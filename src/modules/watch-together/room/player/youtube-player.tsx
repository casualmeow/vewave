import { useEffect, useMemo, useRef } from 'react'
import { initialEmbeddedPlayerInfo } from './types'
import type { RefObject } from 'react'
import type { EmbeddedPlayerController, EmbeddedPlayerInfo } from './types'
import type {
  GetApiRoomsByCode200Media,
  GetApiRoomsByCode200Playback,
} from '@/core/api/generated/model'
import { cn } from '@/shared/lib/utils'

type YouTubePlayerProps = {
  media: GetApiRoomsByCode200Media
  playback: GetApiRoomsByCode200Playback | null
  className?: string
  onInfo?: (info: EmbeddedPlayerInfo) => void
  controllerRef?: RefObject<EmbeddedPlayerController | null>
}

/**
 * Chromeless synchronized YouTube embed. Native controls are disabled
 * (`controls=0`) — the room control bar is the only visible control system.
 * Player telemetry (time, duration, state, volume) flows out through `onInfo`;
 * local-only audio commands flow in through `controllerRef`.
 */
export function YouTubePlayer({
  media,
  playback,
  className,
  onInfo,
  controllerRef,
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const lastAppliedVersionRef = useRef<number | null>(null)
  const infoRef = useRef<EmbeddedPlayerInfo>(initialEmbeddedPlayerInfo)
  const onInfoRef = useRef(onInfo)
  onInfoRef.current = onInfo
  const embedUrl = useMemo(() => getYouTubeEmbedUrl(media), [media])

  useEffect(() => {
    if (!playback || lastAppliedVersionRef.current === playback.version) {
      return
    }

    lastAppliedVersionRef.current = playback.version
    postYouTubeCommand(iframeRef.current, 'seekTo', [playback.effectivePositionMs / 1000, true])

    if (playback.status === 'playing') {
      postYouTubeCommand(iframeRef.current, 'playVideo')
    }

    if (playback.status === 'paused' || playback.status === 'ended') {
      postYouTubeCommand(iframeRef.current, 'pauseVideo')
    }
  }, [playback])

  useEffect(() => {
    if (!controllerRef) {
      return
    }

    controllerRef.current = {
      setVolume: (volume) => {
        postYouTubeCommand(iframeRef.current, 'setVolume', [Math.round(volume)])

        if (volume > 0) {
          postYouTubeCommand(iframeRef.current, 'unMute')
        }
      },
      mute: () => postYouTubeCommand(iframeRef.current, 'mute'),
      unmute: () => postYouTubeCommand(iframeRef.current, 'unMute'),
    }

    return () => {
      controllerRef.current = null
    }
  }, [controllerRef])

  useEffect(() => {
    function emitInfo(patch: Partial<EmbeddedPlayerInfo>) {
      const next = { ...infoRef.current, ...patch }
      infoRef.current = next
      onInfoRef.current?.(next)
    }

    function handleMessage(event: MessageEvent) {
      const iframe = iframeRef.current

      if (!iframe || event.source !== iframe.contentWindow) {
        return
      }

      let data: unknown = event.data

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }

      if (typeof data !== 'object' || data === null) {
        return
      }

      const message = data as { event?: string; info?: Record<string, unknown> }

      if (message.event === 'onReady') {
        emitInfo({ ready: true })
        return
      }

      if (message.event !== 'infoDelivery' || !message.info) {
        return
      }

      const info = message.info
      const next: Partial<EmbeddedPlayerInfo> = { ready: true }

      if (typeof info.currentTime === 'number') {
        next.currentTimeMs = info.currentTime * 1000
      }

      if (typeof info.duration === 'number' && info.duration > 0) {
        next.durationMs = info.duration * 1000
      }

      if (typeof info.playerState === 'number') {
        next.playerState = info.playerState
      }

      if (typeof info.volume === 'number') {
        next.volume = info.volume
      }

      if (typeof info.muted === 'boolean') {
        next.muted = info.muted
      }

      emitInfo(next)
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <iframe
      ref={iframeRef}
      title={media.title ?? 'YouTube player'}
      src={embedUrl}
      className={cn('h-full w-full bg-media-background', className)}
      allow="autoplay; encrypted-media; picture-in-picture"
      onLoad={() => beginListening(iframeRef.current)}
    />
  )
}

function getYouTubeEmbedUrl(media: GetApiRoomsByCode200Media) {
  const source = media.embedUrl || `https://www.youtube.com/embed/${media.externalId}`
  const url = new URL(source)
  url.searchParams.set('enablejsapi', '1')
  url.searchParams.set('playsinline', '1')
  url.searchParams.set('controls', '0')
  url.searchParams.set('rel', '0')
  url.searchParams.set('iv_load_policy', '3')
  url.searchParams.set('disablekb', '1')
  url.searchParams.set('fs', '0')

  if (typeof window !== 'undefined') {
    url.searchParams.set('origin', window.location.origin)
  }

  return url.toString()
}

/** Ask the widget to start streaming `infoDelivery` messages back to us. */
function beginListening(iframe: HTMLIFrameElement | null) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: 'listening', id: 'vewave-room', channel: 'widget' }),
    '*',
  )
}

function postYouTubeCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: Array<string | number | boolean> = [],
) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
}
