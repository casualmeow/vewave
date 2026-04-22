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
      <div className="bg-secondary p-4 rounded-lg shadow-md flex flex-col gap-2">
        <MinifiedVideoPlayer
          src={src}
          className="w-full aspect-auto"
          autoPlay={false}
          muted={false}
          loop={false}
        />
        <div className="flex flex-col">
          <div className="text-sm">File link</div>
          <div className="w-full flex flex-row justify-between">
            <Button variant="link" className="p-0" type="button" onClick={handleOpenLink}>
              {src}
            </Button>
            <Tooltip text={isCopied ? 'Link copied!' : 'Copy link'}>
              <Button variant="ghost" type="button" onClick={handleCopy}>
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
