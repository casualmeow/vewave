import { useEffect, useMemo, useRef } from 'react'
import type {
  GetApiRoomsByCode200Media,
  GetApiRoomsByCode200Playback,
} from '@/core/api/generated/model'

type YouTubePlayerProps = {
  media: GetApiRoomsByCode200Media
  playback: GetApiRoomsByCode200Playback | null
}

export function YouTubePlayer({ media, playback }: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const lastAppliedVersionRef = useRef<number | null>(null)
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

  return (
    <iframe
      ref={iframeRef}
      title={media.title ?? 'YouTube player'}
      src={embedUrl}
      className="aspect-video w-full rounded-xl border bg-media-background"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  )
}

function getYouTubeEmbedUrl(media: GetApiRoomsByCode200Media) {
  const source = media.embedUrl || `https://www.youtube.com/embed/${media.externalId}`
  const url = new URL(source)
  url.searchParams.set('enablejsapi', '1')
  url.searchParams.set('playsinline', '1')

  if (typeof window !== 'undefined') {
    url.searchParams.set('origin', window.location.origin)
  }

  return url.toString()
}

function postYouTubeCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: Array<string | number | boolean> = [],
) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
}
