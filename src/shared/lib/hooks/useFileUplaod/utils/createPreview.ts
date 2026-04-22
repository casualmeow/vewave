import { type FileMetadata } from '../types'

export function createPreview(file: File | FileMetadata): string | undefined {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file.url
}
