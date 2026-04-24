import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from 'react'
import { mapInitialFiles, resetInputValue, revokeFilePreview, revokeFilePreviews } from './helpers'
import {
  getDroppedFiles,
  isLeavingCurrentTarget,
  preventDragDefaults,
  processIncomingFiles,
} from './utils'
import type { FileUploadActions, FileUploadOptions, FileUploadState } from './types'

export const useFileUpload = (
  options: FileUploadOptions = {},
): [FileUploadState, FileUploadActions] => {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = '*',
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
  } = options

  const [state, setState] = useState<FileUploadState>({
    files: mapInitialFiles(initialFiles),
    isDragging: false,
    errors: [],
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const clearFiles = useCallback(() => {
    setState((prev) => {
      revokeFilePreviews(prev.files)

      const nextState: FileUploadState = {
        ...prev,
        files: [],
        errors: [],
      }

      onFilesChange?.(nextState.files)
      return nextState
    })

    resetInputValue(inputRef.current)
  }, [onFilesChange])

  const addFiles = useCallback(
    (newFiles: FileList | Array<File>) => {
      const incomingFiles = Array.from(newFiles ?? [])
      if (incomingFiles.length === 0) return

      const currentFiles = state.files

      const { nextFiles, addedFiles, errors } = processIncomingFiles({
        incomingFiles,
        currentFiles,
        maxFiles,
        maxSize,
        accept,
        multiple,
      })

      if (!multiple) {
        revokeFilePreviews(currentFiles)
      }

      if (addedFiles.length > 0) {
        onFilesAdded?.(addedFiles)
        onFilesChange?.(nextFiles)
      }

      setState((prev) => ({
        ...prev,
        files: addedFiles.length > 0 ? nextFiles : prev.files,
        errors,
      }))

      resetInputValue(inputRef.current)
    },
    [accept, maxFiles, maxSize, multiple, onFilesAdded, onFilesChange, state.files],
  )

  const removeFile = useCallback(
    (id: string) => {
      setState((prev) => {
        const fileToRemove = prev.files.find((file) => file.id === id)

        if (fileToRemove) {
          revokeFilePreview(fileToRemove)
        }

        const nextFiles = prev.files.filter((file) => file.id !== id)
        onFilesChange?.(nextFiles)

        return {
          ...prev,
          files: nextFiles,
          errors: [],
        }
      })
    },
    [onFilesChange],
  )

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: [],
    }))
  }, [])

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    preventDragDefaults(e)
    setState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    preventDragDefaults(e)

    if (!isLeavingCurrentTarget(e)) {
      return
    }

    setState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    preventDragDefaults(e)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      preventDragDefaults(e)
      setState((prev) => ({ ...prev, isDragging: false }))

      if (inputRef.current?.disabled) {
        return
      }

      const droppedFiles = getDroppedFiles(e, multiple)
      if (droppedFiles.length === 0) {
        return
      }

      addFiles(droppedFiles)
    },
    [addFiles, multiple],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) {
        return
      }

      addFiles(selectedFiles)
    },
    [addFiles],
  )

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
      ...props,
      type: 'file' as const,
      onChange: handleFileChange,
      accept: props.accept ?? accept,
      multiple: props.multiple ?? multiple,
      ref: inputRef,
    }),
    [accept, multiple, handleFileChange],
  )

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
  ]
}
