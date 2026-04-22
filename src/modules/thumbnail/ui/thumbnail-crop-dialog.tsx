import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/shared/ui'

interface ThumbnailCropDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  imageSrc: string
}

export const ThumbnailCropDialog = ({ imageSrc, open, onOpenChange }: ThumbnailCropDialogProps) => {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop Thumbnail</DialogTitle>
          </DialogHeader>
          <Cropper image={imageSrc} aspectRatio={16 / 9} minZoom={1} maxZoom={10} className="h-80">
            <CropperDescription>
              Adjust the crop area to select the desired thumbnail portion.
            </CropperDescription>
            <CropperImage />
            <CropperCropArea />
          </Cropper>
        </DialogContent>
      </Dialog>
    </>
  )
}
