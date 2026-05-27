import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Tooltip } from '@/shared/ui'
import { MinifiedVideoPlayer } from '@/modules/video'

interface EditPlayerProps {
  src: string
}

export default function EditPlayer({ src }: EditPlayerProps) {
  const [isCopied, setIsCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard
      .writeText(src)
      .then(() => {
        setIsCopied(true)
        toast('Success!', {
          description: 'Link copied to clipboard',
          duration: 2000,
        })
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        toast('Failed to copy link: ', err)
      })
  }

  const handleOpenLink = () => {
    window.open(src, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-3 rounded-2xl border bg-secondary/80 p-3 shadow-md sm:p-4">
        <MinifiedVideoPlayer
          src={src}
          className="aspect-video w-full overflow-hidden rounded-xl"
          autoPlay={false}
          muted={false}
          loop={false}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="text-sm font-medium">File link</div>
          <div className="flex w-full min-w-0 flex-row items-center justify-between gap-2">
            <Button
              variant="link"
              className="min-w-0 flex-1 justify-start overflow-hidden p-0 text-left"
              type="button"
              onClick={handleOpenLink}
            >
              <span className="truncate">{src}</span>
            </Button>
            <Tooltip text={isCopied ? 'Link copied!' : 'Copy link'}>
              <Button variant="ghost" size="icon" type="button" onClick={handleCopy}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Tooltip>
          </div>
          <div className="text-sm">Video quality</div>
          {/* TODO: provide pseudocode for qualities */}
        </div>
      </div>
    </div>
  )
}
