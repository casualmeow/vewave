import type { DragEvent } from 'react'

export const preventDragDefaults = (e: DragEvent<HTMLElement>) => {
  e.preventDefault()
  e.stopPropagation()
}

export const isLeavingCurrentTarget = (e: DragEvent<HTMLElement>) => {
  return !e.currentTarget.contains(e.relatedTarget as Node)
}

export const getDroppedFiles = (e: DragEvent<HTMLElement>, multiple: boolean): Array<File> => {
  const files = e.dataTransfer.files

  if (!files || files.length === 0) {
    return []
  }

  return multiple ? Array.from(files) : [files[0]]
}
