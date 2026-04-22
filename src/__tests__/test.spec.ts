import { describe, it, expect } from 'vitest'
import { formatBytes } from '@/shared/lib/hooks/useFileUplaod/utils/formatBytes'

describe('formatBytes', () => {
  it('returns "0 Bytes" when input is 0', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('formats bytes correctly for default decimals (2)', () => {
    expect(formatBytes(1024)).toBe('1KB')
    expect(formatBytes(1048576)).toBe('1MB')
    expect(formatBytes(1073741824)).toBe('1GB')
  })

  it('respects custom decimal values', () => {
    expect(formatBytes(1024, 0)).toBe('1KB')
    expect(formatBytes(1024, 1)).toBe('1KB')
    expect(formatBytes(1048576, 3)).toBe('1MB')
  })

  it('handles negative decimal values by setting to 0', () => {
    expect(formatBytes(1048576, -5)).toBe('1MB')
  })

  it('returns integer string when no decimals are required', () => {
    expect(formatBytes(512, 0)).toBe('512Bytes')
  })
})
