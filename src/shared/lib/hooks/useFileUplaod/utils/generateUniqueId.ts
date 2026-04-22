import { useCallback } from 'react'
import { type FileMetadata } from '../types'

export const generateUniqueId = (file: File | FileMetadata): string => {
  if (file instanceof File) {
    return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
  return file.id
}
