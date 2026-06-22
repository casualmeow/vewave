import { render, act } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFileUpload } from './useFileUpload'
import type { FileUploadActions } from './types'

const OriginalURL = URL

const renderUseFileUpload = (onReady: (actions: FileUploadActions) => void) => {
  const Harness = () => {
    const [, actions] = useFileUpload({ multiple: true })

    useEffect(() => {
      onReady(actions)
    }, [actions, onReady])

    return null
  }

  return render(<Harness />)
}

describe('useFileUpload', () => {
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

  it('revokes object URL previews on unmount', () => {
    let actions: FileUploadActions | undefined
    const file = new File(['abc'], 'preview.png', { type: 'image/png' })

    const { unmount } = renderUseFileUpload((nextActions) => {
      actions = nextActions
    })

    expect(actions).toBeDefined()

    act(() => {
      actions?.addFiles([file])
    })

    unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })
})
