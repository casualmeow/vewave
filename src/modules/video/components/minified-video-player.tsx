import { memo, useEffect, useRef, useState } from 'react'
import { Pause, Play, VolumeX, Volume2, Settings, Check, Minimize, Maximize } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { useAppearance } from '@/shared/theme'
import { Button } from '@/shared/ui'
import { glassSurfaceVariants } from '@/shared/ui/glass-surface'
import { Slider } from '@/shared/ui/slider'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
}

export const MinifiedVideoPlayer = memo(function ({
  src,
  poster,
  className,
  autoPlay = false,
  muted = false,
  loop = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [quality, setQuality] = useState('1080p')
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(autoPlay)
  const [loopEnabled, setLoopEnabled] = useState(loop)
  const { settings } = useAppearance()
  const glassChrome = settings.surfaceStyle === 'glass'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return

      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange([Math.min(100, volume * 100 + 10)])
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange([Math.max(0, volume * 100 - 10)])
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'KeyK':
          e.preventDefault()
          togglePlay()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [volume, isPlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = playbackSpeed
    video.loop = loopEnabled
  }, [playbackSpeed, loopEnabled])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: Array<number>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: Array<number>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const qualities = ['360p', '480p', '720p', '1080p', '1440p', '2160p']

  return (
    <div
      ref={containerRef}
      className={cn('relative group overflow-hidden rounded-xl bg-media-background', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        autoPlay={autoPlayEnabled}
        muted={muted}
        loop={loopEnabled}
        onClick={togglePlay}
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 transition-opacity duration-300',
          glassChrome
            ? cn(
                'm-2 rounded-lg border',
                glassSurfaceVariants({
                  role: 'media',
                  thickness: 'thin',
                  elevation: 'embedded',
                }),
              )
            : 'bg-gradient-to-t from-media-background/80 via-media-background/40 to-transparent',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className={cn('px-4 pb-2', glassChrome && 'pt-2')}>
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-media-muted [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-media-foreground [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&>span:first-child_span]:bg-media-foreground"
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-2 h-12">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              type="button"
              variant="ghost"
              className="h-8 w-8 text-media-foreground hover:bg-media-control"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-media-foreground" />
              ) : (
                <Play className="h-4 w-4 fill-media-foreground" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                type="button"
                variant="ghost"
                className="h-8 w-8 text-media-foreground hover:bg-media-control"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <div className="w-16">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-media-muted [&_[role=slider]]:h-2 [&_[role=slider]]:w-2 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-media-foreground [&>span:first-child_span]:bg-media-foreground"
                />
              </div>
            </div>

            <div className="font-mono text-xs text-media-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-media-foreground hover:bg-media-control"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent disablePortal className="w-56" align="end">
                <DropdownMenuLabel>Video Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Playback Speed
                    <span className="ml-auto text-xs text-muted-foreground">{playbackSpeed}x</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {playbackSpeeds.map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className="flex items-center justify-between"
                      >
                        {speed}x{playbackSpeed === speed && <Check className="w-4 h-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Quality
                    <span className="ml-auto text-xs text-muted-foreground">{quality}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {qualities.map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q)}
                        className="flex items-center justify-between"
                      >
                        {q}
                        {quality === q && <Check className="w-4 h-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className="flex items-center justify-between"
                >
                  Subtitles
                  {subtitlesEnabled && <Check className="w-4 h-4" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  className="flex items-center justify-between"
                >
                  Auto-play
                  {autoPlayEnabled && <Check className="w-4 h-4" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setLoopEnabled(!loopEnabled)}
                  className="flex items-center justify-between"
                >
                  Loop
                  {loopEnabled && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              type="button"
              variant="ghost"
              className="h-8 w-8 text-media-foreground hover:bg-media-control"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
