import { useState, useEffect, useCallback } from 'react'
import { ThumbnailCropDialog } from './thumbnail-crop-dialog'
import { ThumbnailCard } from './thumbnail-card'
import { ThumbnailUpload } from './thumbnail-upload'
import type { Area } from '../utils/types'
import { useFileUpload } from '@/shared/lib/hooks/useFileUplaod'

const initialFiles = [
  {
    name: 'image-01.jpg',
    size: 1528737,
    type: 'image/jpeg',
    url: 'https://picsum.photos/1000/800?grayscale&random=1',
    id: 'image-01-123456789',
  },
  {
    name: 'image-02.jpg',
    size: 1528737,
    type: 'image/jpeg',
    url: 'https://picsum.photos/1000/800?grayscale&random=2',
    id: 'image-02-123456789',
  },
  {
    name: 'image-03.jpg',
    size: 1528737,
    type: 'image/jpeg',
    url: 'https://picsum.photos/1000/800?grayscale&random=3',
    id: 'image-03-123456789',
  },
  {
    name: 'image-04.jpg',
    size: 1528737,
    type: 'image/jpeg',
    url: 'https://picsum.photos/1000/800?grayscale&random=4',
    id: 'image-04-123456789',
  },
]

export const ThumbnailManager = () => {
  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024
  const maxFiles = 6

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [zoom, setZoom] = useState(1)

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: 'image/svg+xml,image/png,image/jpeg,image/jpg,image/gif',
    maxSize,
    multiple: true,
    maxFiles,
    initialFiles,
    onFilesAdded: (addedFiles) => {
      const latestFile = addedFiles[addedFiles.length - 1]
      if (!latestFile) return

      setCroppedAreaPixels(null)
      setZoom(1)
      setFinalImageUrl(latestFile.preview ?? null)
      setIsDialogOpen(true)
    },
  })

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleOpenDialog = () => {
    openFileDialog()
  }

  useEffect(() => {
    return () => {
      if (finalImageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(finalImageUrl)
      }
    }
  }, [finalImageUrl])

  return (
    <div className="flex flex-row gap-2">
      {files.map((file) => (
        <div key={file.id} className="relative">
          <ThumbnailCard
            src={file.preview}
            alt={file.file.name}
            onClose={() => removeFile(file.id)}
          />
        </div>
      ))}

      <ThumbnailUpload
        onClick={handleOpenDialog}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        isDragging={isDragging}
      />

      <input
        {...getInputProps()}
        className="sr-only"
        aria-label="Upload image file"
        tabIndex={-1}
      />

      <ThumbnailCropDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        imageSrc={finalImageUrl ?? ''}
      />
    </div>
  )
}
