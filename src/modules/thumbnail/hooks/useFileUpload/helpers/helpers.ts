import type { FileUploadOptions, FileWithPreview, FileMetadata } from '../types'

export const mapInitialFiles = (
  initialFiles: FileUploadOptions['initialFiles'] = [],
): Array<FileWithPreview> => {
  return initialFiles.map((file: FileMetadata) => ({
    file,
    id: file.id,
    preview: file.url,
  }))
}

export const revokeFilePreview = (file: FileWithPreview) => {
  if (file.preview && file.file instanceof File && file.file.type.startsWith('image/')) {
    URL.revokeObjectURL(file.preview)
  }
}

export const revokeFilePreviews = (files: Array<FileWithPreview>) => {
  files.forEach(revokeFilePreview)
}

export const resetInputValue = (input: HTMLInputElement | null) => {
  if (input) {
    input.value = ''
  }
}

export const isDuplicateFile = (file: File, existingFiles: Array<FileWithPreview>) => {
  return existingFiles.some(
    (existingFile) => existingFile.file.name === file.name && existingFile.file.size === file.size,
  )
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

export function createPreview(file: File | FileMetadata): string | undefined {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file.url
}
