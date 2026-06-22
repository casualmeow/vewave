import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { processIncomingFiles } from './processor'

const OriginalURL = URL

describe('processIncomingFiles', () => {
  beforeEach(() => {
    class MockURL extends OriginalURL {
      static createObjectURL = vi.fn(() => 'blob:preview')
      static revokeObjectURL = vi.fn()
    }

    vi.stubGlobal('URL', MockURL)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deduplicates identical files within the same batch', () => {
    const firstFile = new File(['abc'], 'same.png', { type: 'image/png' })
    const secondFile = new File(['abc'], 'same.png', { type: 'image/png' })

    const result = processIncomingFiles({
      incomingFiles: [firstFile, secondFile],
      currentFiles: [],
      maxFiles: 10,
      maxSize: Infinity,
      accept: 'image/*',
      multiple: true,
    })

    expect(result.addedFiles).toHaveLength(1)
    expect(result.nextFiles).toHaveLength(1)
  })
})
