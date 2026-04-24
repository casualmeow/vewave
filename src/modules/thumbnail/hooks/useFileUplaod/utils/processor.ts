import { validateFile, generateUniqueId } from '../utils'
import { formatBytes, createPreview, isDuplicateFile } from '../helpers'
import type {
  FileWithPreview,
  ProcessIncomingFilesParams,
  ProcessIncomingFilesResult,
} from '../types'

export const processIncomingFiles = ({
  incomingFiles,
  currentFiles,
  maxFiles,
  maxSize,
  accept,
  multiple,
}: ProcessIncomingFilesParams): ProcessIncomingFilesResult => {
  const errors: Array<string> = []

  if (multiple && maxFiles !== Infinity && currentFiles.length + incomingFiles.length > maxFiles) {
    return {
      nextFiles: currentFiles,
      addedFiles: [],
      errors: [`You can only upload a maximum of ${maxFiles} files.`],
    }
  }

  const addedFiles: Array<FileWithPreview> = []

  incomingFiles.forEach((file) => {
    if (multiple && isDuplicateFile(file, currentFiles)) {
      return
    }

    if (file.size > maxSize) {
      errors.push(
        multiple
          ? `Some files exceed the maximum size of ${formatBytes(maxSize)}.`
          : `File exceeds the maximum size of ${formatBytes(maxSize)}.`,
      )
      return
    }

    const error = validateFile(file, { maxSize, accept })

    if (error) {
      errors.push(error)
      return
    }

    addedFiles.push({
      file,
      id: generateUniqueId(file),
      preview: createPreview(file),
    })
  })

  const nextFiles = multiple ? [...currentFiles, ...addedFiles] : addedFiles

  return {
    nextFiles,
    addedFiles,
    errors,
  }
}
