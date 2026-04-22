import { Image } from 'lucide-react'

interface ThumbnailUploadProps {
  handleDragEnter: () => void
  handleDragLeave: () => void
  handleDragOver: () => void
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void
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
