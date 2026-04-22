import { XIcon } from 'lucide-react'
import { Button } from '@/shared/ui'

interface ThumbnailCardProps {
  src: string | undefined
  alt: string
  onActive?: () => void // add active state for component
  onClose: () => void
}

const imageStyle = {
  width: '12rem', // Tailwind's w-48
  objectFit: 'cover',
  borderRadius: '0.375rem', // Tailwind's rounded-md
  aspectRatio: '16 / 9', // Tailwind's aspect-video
}

export const ThumbnailCard = ({ src, alt, onActive, onClose }: ThumbnailCardProps) => {
  return (
    <div className="w-fit">
      <img
        src={src}
        alt={alt}
        className="object-cover rounded-md aspect-video w-48"
        // style={{ width: '12rem', aspectRatio: '16 / 9' }}
      />
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
