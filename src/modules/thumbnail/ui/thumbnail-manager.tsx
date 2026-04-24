import { useState, useEffect } from 'react'
import { useFileUpload } from '../hooks/useFileUplaod'
import { FileConstraints } from '../constants/file-constraints'
import { initialFiles } from '../api/getPreviews.mock'
import { ThumbnailCropDialog } from './thumbnail-crop-dialog'
import { ThumbnailCard } from './thumbnail-card'
import { ThumbnailUpload } from './thumbnail-upload'
import type { Area } from '../utils/types'

export const ThumbnailManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [_croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [_zoom, setZoom] = useState(1)

  const [
    { files, isDragging },
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
    maxSize: FileConstraints.MAX_SIZE,
    multiple: true,
    maxFiles: FileConstraints.MAX_FILES,
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
