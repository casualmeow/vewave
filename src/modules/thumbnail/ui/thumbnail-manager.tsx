import { useState, useEffect, useRef, useCallback } from 'react'
import { ThumbnailCropDialog } from './thumbnail-crop-dialog'
import { ThumbnailCard } from './thumbnail-card'
import { ThumbnailUpload } from './thumbnail-upload'
import type { Area } from '../utils/types'
import { useFileUpload } from '@/shared/lib/hooks/useFileUplaod'

interface ThumbnailManagerProps {
  videoSrc?: string
  thumbnailSrc?: string
  onThumbnailChange?: (file: File) => void
}

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
  })

  const previewUrl = files[0]?.preview || null
  const fileId = files[0]?.id

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)

  const previousFileIdRef = useRef<string | undefined | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // State for zoom level
  const [zoom, setZoom] = useState(1)

  // Callback for Cropper to provide crop data - Wrap with useCallback
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  useEffect(() => {
    const currentFinalUrl = finalImageUrl
    // Cleanup function
    return () => {
      if (currentFinalUrl && currentFinalUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentFinalUrl)
      }
    }
  }, [finalImageUrl])

  useEffect(() => {
    // Check if fileId exists and is different from the previous one
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true) // Open dialog for the new file
      setCroppedAreaPixels(null) // Reset crop area for the new file
      setZoom(1) // Reset zoom for the new file
    }
    previousFileIdRef.current = fileId
  }, [fileId])

  const dummy = () => {
    console.log('123')
  }

  return (
    <>
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
          onClick={openFileDialog}
          handleDragOver={() => handleDragOver}
          handleDrop={() => handleDrop}
          handleDragEnter={() => handleDragEnter}
          handleDragLeave={() => handleDragLeave}
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
    </>
  )
}
