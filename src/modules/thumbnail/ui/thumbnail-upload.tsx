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
      className="w-48 h-27 flex flex-col items-center justify-center
        border-2 border-dashed border-gray-300 rounded-md
        cursor-pointer hover:border-gray-400"
    >
      <Image />
      <div>Upload photo</div>
    </button>
  )
}
