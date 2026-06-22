import { Image } from 'lucide-react'
import type { DragEventHandler } from 'react'

interface ThumbnailUploadProps {
  handleDragEnter: DragEventHandler<HTMLButtonElement>
  handleDragLeave: DragEventHandler<HTMLButtonElement>
  handleDragOver: DragEventHandler<HTMLButtonElement>
  handleDrop: DragEventHandler<HTMLButtonElement>
  onClick: () => void
  isDragging: boolean
}

export const ThumbnailUpload = ({
  onClick,
  handleDragEnter,
  handleDragOver,
  handleDrop,
  handleDragLeave,
  isDragging,
}: ThumbnailUploadProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-dragging={isDragging || undefined}
      className="flex h-27 w-48 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-dragging:border-primary data-dragging:bg-primary/10"
    >
      <Image />
      <div>Upload photo</div>
    </button>
  )
}
