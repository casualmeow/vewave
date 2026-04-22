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

export type FileUploadOptions = {
  maxFiles?: number // Only used when multiple is true, defaults to Infinity
  maxSize?: number // in bytes
  accept?: string
  multiple?: boolean // Defaults to false
  initialFiles?: Array<FileMetadata>
  onFilesChange?: (files: Array<FileWithPreview>) => void // Callback when files change
  onFilesAdded?: (addedFiles: Array<FileWithPreview>) => void // Callback when new files are added
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
