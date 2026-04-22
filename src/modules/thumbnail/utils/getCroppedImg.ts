import { createImage } from './createImage'
import type { Area } from './types'

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height,
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg')
    })
  } catch (error) {
    console.error('Error in getCroppedImg:', error)
    return null
  }
}
