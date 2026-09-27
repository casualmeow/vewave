import { describe, expect, it } from 'vitest'

import {
  getRoomOverlayStyle,
  roomOverlayClassName,
} from '@/modules/watch-together/room/components/room-chrome'
import { defaultRoomOverlayPreferences } from '@/modules/watch-together/room/model/room-preferences'

describe('room overlay material preferences', () => {
  it('passes saved settings to the media material without defeating Solid or accessibility CSS', () => {
    const style = getRoomOverlayStyle({
      ...defaultRoomOverlayPreferences,
      opacity: 73,
      blur: 35,
      cornerRadius: 16,
    }) as Record<string, unknown>

    expect(style['--glass-media-opacity']).toBe('73%')
    expect(style['--glass-media-filter']).toBe('blur(7px)')
    expect(style.borderRadius).toBe(16)
    expect(style).not.toHaveProperty('backgroundColor')
    expect(style).not.toHaveProperty('backdropFilter')
    expect(style).not.toHaveProperty('WebkitBackdropFilter')
    expect(roomOverlayClassName).toContain('glass-surface-auto')
    expect(roomOverlayClassName).toContain('glass-surface-media')
  })

  it('keeps zero blur and outline off instead of inheriting the glass defaults', () => {
    const style = getRoomOverlayStyle({
      ...defaultRoomOverlayPreferences,
      blur: 0,
      outline: 0,
    }) as Record<string, unknown>
    expect(style['--glass-media-filter']).toBe('none')
    expect(style.boxShadow).toBe('none')
  })
})
