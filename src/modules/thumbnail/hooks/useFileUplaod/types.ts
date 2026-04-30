import type { ChangeEvent, InputHTMLAttributes } from 'react'

export type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
}

export interface ProcessIncomingFilesParams {
  incomingFiles: Array<File>
  currentFiles: Array<FileWithPreview>
  maxFiles: number
  maxSize: number
  accept: string
  multiple: boolean
}

export interface ProcessIncomingFilesResult {
  nextFiles: Array<FileWithPreview>
  addedFiles: Array<FileWithPreview>
  errors: Array<string>
}

/**
 * File upload options
 * @param maxFiles - Only used when multiple is true, defaults to Infinity
 * @param maxSize - in bytes
 * @param accept - file type filter
 * @param multiple - Defaults to false
 * @param initialFiles - initial files to upload
 * @param onFilesChange - Callback when files change
 * @param onFilesAdded - Callback when new files are added
 */
export type FileUploadOptions = {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  initialFiles?: Array<FileMetadata>
  onFilesChange?: (files: Array<FileWithPreview>) => void
  onFilesAdded?: (addedFiles: Array<FileWithPreview>) => void
}

export type FileUploadState = {
  files: Array<FileWithPreview>
  isDragging: boolean
  errors: Array<string>
}

export type FileUploadActions = {
  addFiles: (files: FileList | Array<File>) => void
  clearFiles: () => void
  clearErrors: () => void
  removeFile: (id: string) => void
  handleDragEnter: (e: React.DragEvent<HTMLElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void
  handleDrop: (e: React.DragEvent<HTMLElement>) => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>,
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>
  }
}
