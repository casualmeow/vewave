import { type FileMetadata, type FileUploadOptions } from '../types'
import { formatBytes } from './formatBytes'

type FileValidateOptions = Required<Pick<FileUploadOptions, 'maxSize' | 'accept'>>

export const validateFile = (
  file: File | FileMetadata,
  { maxSize, accept }: FileValidateOptions,
): string | null => {
  if (file instanceof File) {
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`
    }
  } else {
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`
    }
  }

  if (accept !== '*') {
    const acceptedTypes = accept.split(',').map((type) => type.trim())
    const fileType = file instanceof File ? file.type || '' : file.type
    const fileExtension = `.${file instanceof File ? file.name.split('.').pop() : file.name.split('.').pop()}`

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileExtension.toLowerCase() === type.toLowerCase()
      }
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0]
        return fileType.startsWith(`${baseType}/`)
      }
      return fileType === type
    })

    if (!isAccepted) {
      return `File "${file instanceof File ? file.name : file.name}" is not an accepted file type.`
    }
  }

  return null
}
