import { XIcon } from 'lucide-react'
import { Button } from '@/shared/ui'

interface ThumbnailCardProps {
  src: string | undefined
  alt: string
  onActive?: () => void
  onClose: () => void
}

export const ThumbnailCard = ({ src, alt, onClose }: ThumbnailCardProps) => {
  return (
    <div className="w-fit">
      <img src={src} alt={alt} className="object-cover rounded-md aspect-video w-48" />
      <Button
        size="icon"
        className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
        aria-label="Remove image"
        onClick={onClose}
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  )
}
