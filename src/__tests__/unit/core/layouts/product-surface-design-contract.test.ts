import { describe, expect, it } from 'vitest'

import landingIndexPageSource from '@/modules/landing/landing-index-page.tsx?raw'

import appLayoutSource from '@/core/layouts/app-layout/layout.tsx?raw'
import landingHeaderSource from '@/core/layouts/landing-layout/ui/landing-header.tsx?raw'
import projectCardContentSource from '@/modules/projects/components/project-card-content.tsx?raw'
import projectsPageSource from '@/modules/projects/components/projects-page.tsx?raw'
import createRoomFormSource from '@/modules/watch-together/create-room/components/create-room-form.tsx?raw'
import roomPageSource from '@/modules/watch-together/room/components/room-page.tsx?raw'
import roomVideoListSource from '@/modules/watch-together/room/components/room-video-list.tsx?raw'
import useRoomRealtimeSource from '@/modules/watch-together/room/hooks/use-room-realtime.ts?raw'

const workflowSurfaces = [
  {
    name: 'app layout',
    source: appLayoutSource,
  },
  {
    name: 'projects page',
    source: projectsPageSource,
  },

  {
    name: 'project card content',
    source: projectCardContentSource,
  },
] as const

describe('product surface design contract', () => {
  it.each(workflowSurfaces)('$name avoids oversized decorative shells', ({ source }) => {
    expect(source).not.toContain('rounded-[2rem]')
    expect(source).not.toContain('rounded-3xl')
    expect(source).not.toContain('shadow-[0_28')
  })

  it('app layout avoids decorative page-level light fields', () => {
    expect(appLayoutSource).not.toContain('radial-gradient')
  })

  it('rooms page start action stays a stable task surface', () => {
    expect(projectsPageSource).not.toContain('motion.')
    expect(projectsPageSource).not.toContain('useMotionValue')
    expect(projectsPageSource).not.toContain('project-pointer')
    expect(projectsPageSource).not.toContain('Sparkles')
    expect(projectsPageSource).not.toContain('SIDEBAR_FLUID_TRANSITION')
  })

  it('guest zero-room state is a focused first-run creation page', () => {
    const firstRoomPageSource = projectsPageSource.slice(
      projectsPageSource.indexOf('function FirstRoomPage'),
      projectsPageSource.indexOf('export function RoomsDashboardView'),
    )

    expect(appLayoutSource).toContain('firstRunCreationState')
    expect(appLayoutSource).toContain('return <Outlet />')
    expect(firstRoomPageSource).toContain('Create your first room')
    expect(firstRoomPageSource).toContain('max-w-[35rem]')
    expect(firstRoomPageSource).toContain('pt-[clamp(6rem,14vh,10rem)]')
    expect(firstRoomPageSource).toContain('CreateRoomForm variant="firstRun"')
    expect(firstRoomPageSource).toContain('Sign in to sync')
    expect(firstRoomPageSource).not.toContain('>Rooms</p>')
    expect(projectsPageSource).not.toContain('RoomStartSummary')
    expect(projectsPageSource).not.toContain('Ready in one step')
  })

  it('room cards render real thumbnail collages for multi-video rooms', () => {
    expect(projectCardContentSource).toContain('function RoomMediaCollage')
    expect(projectCardContentSource).toContain('if (item.videos > 1)')
    expect(projectCardContentSource).toContain('<RoomMediaBackdrop item={item} />')
    expect(projectsPageSource).toContain('thumbnailUrls')
  })

  it('room page exposes the playlist and add-video controls in the right rail', () => {
    expect(roomPageSource).toContain('<RoomVideoList')
    expect(roomPageSource).toContain('sendMediaAdd={sendMediaAdd}')
    expect(roomPageSource).toContain('<RoomPresence')
    expect(roomVideoListSource).toContain('Video list')
    expect(roomVideoListSource).toContain('Paste video link')
    expect(roomVideoListSource).toContain('Add video')
    expect(roomVideoListSource).toContain('snapshot.mediaItems.map')
    expect(useRoomRealtimeSource).toContain('createMediaAddCommand')
    expect(useRoomRealtimeSource).toContain('sendMediaAdd')
  })

  it('room creation form keeps one primary action without a permanent check-link step', () => {
    expect(createRoomFormSource).toContain('Create and open room')
    expect(createRoomFormSource).toContain('Validating link...')
    expect(createRoomFormSource).toContain('Video found:')
    expect(createRoomFormSource).toContain('This name will be shown to invited viewers.')
    expect(createRoomFormSource).toContain(
      'After creation, the room opens with the video source, invite link, and synced playback',
    )
    expect(createRoomFormSource).not.toContain('Check link')
  })

  it('landing hero uses the theme-aware product mark', () => {
    expect(landingIndexPageSource).toContain('VewaveLogoMark')
    expect(landingIndexPageSource).not.toContain('/vewave-mark.svg')
  })

  it('landing header logo resolves against the header surface', () => {
    expect(landingHeaderSource).toContain('VewaveLogoMark decorative surfaceToken="header"')
    expect(landingHeaderSource).not.toContain('surfaceToken="foreground"')
  })
})
