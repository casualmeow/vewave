/**
 * Spelling-based design-contract tests — see navigation-design-contract.test.ts
 * for the full maintenance contract. These assert on raw source strings, so
 * refactors near imported files will break assertions: update the spelling to
 * match, do not auto-rewrite the test. Convert to render tests only if a
 * single assertion has broken 3+ times for non-substantive reasons.
 */
import { describe, expect, it } from 'vitest'

import landingIndexPageSource from '@/modules/landing/landing-index-page.tsx?raw'

import appLayoutSource from '@/core/layouts/app-layout/layout.tsx?raw'
import landingHeaderSource from '@/core/layouts/landing-layout/ui/landing-header.tsx?raw'
import createRoomRouteSource from '@/routes/_app/create/index.tsx?raw'
import projectsRouteSource from '@/routes/_app/projects/index.tsx?raw'
import roomRouteSource from '@/routes/_app/room/$code/index.tsx?raw'
import projectCardContentSource from '@/modules/projects/components/project-card-content.tsx?raw'
import projectsPageSource from '@/modules/projects/components/projects-page.tsx?raw'
import createRoomFormSource from '@/modules/watch-together/create-room/components/create-room-form.tsx?raw'
import roomControlBarSource from '@/modules/watch-together/room/components/room-control-bar.tsx?raw'
import roomPageSource from '@/modules/watch-together/room/components/room-page.tsx?raw'
import roomSidePanelSource from '@/modules/watch-together/room/components/room-side-panel.tsx?raw'
import roomVideoListSource from '@/modules/watch-together/room/components/room-video-list.tsx?raw'
import useRoomRealtimeSource from '@/modules/watch-together/room/hooks/use-room-realtime.ts?raw'

const workflowSurfaces = [
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

  it('app shell keeps an exact viewport height and scrolls inside main', () => {
    expect(appLayoutSource).toContain('md:h-[calc(100vh-2rem)]')
    expect(appLayoutSource).toContain('overflow-auto')
    expect(appLayoutSource).not.toContain('md:min-h-[calc(100vh-2rem)]')
  })

  it('room shell keeps the established outer spacing without restoring its header', () => {
    expect(appLayoutSource).toContain('gap-3 p-3 md:p-4')
    expect(appLayoutSource).not.toContain("inRoom ? 'gap-0 p-0'")
    expect(appLayoutSource).toContain('{inRoom ? null : (')
    expect(appLayoutSource).toContain("inRoom ? 'p-0'")
    expect(appLayoutSource).toContain("'rounded-[2rem] border border-[color:var(--glass-border)]'")
    expect(roomPageSource).not.toContain('h-full min-h-0 overflow-hidden rounded-[2rem]')
    expect(roomPageSource).toContain('rounded-[2rem] focus-visible:ring-inset')
  })

  it('app pages align content to the shell instead of centering with mx-auto', () => {
    expect(projectsPageSource).not.toContain('mx-auto grid w-full')
  })

  it('rooms page start action stays a stable task surface', () => {
    expect(projectsPageSource).not.toContain('motion.')
    expect(projectsPageSource).not.toContain('useMotionValue')
    expect(projectsPageSource).not.toContain('project-pointer')
    expect(projectsPageSource).not.toContain('Sparkles')
    expect(projectsPageSource).not.toContain('SIDEBAR_FLUID_TRANSITION')
  })

  it('watch-together app routes require an authenticated user', () => {
    const protectedRouteSources = [projectsRouteSource, createRoomRouteSource, roomRouteSource]

    protectedRouteSources.forEach((source) => {
      expect(source).toContain('requireAuthRoute')
      expect(source).toContain('beforeLoad')
    })
    expect(appLayoutSource).not.toContain('firstRunCreationState')
    expect(projectsPageSource).not.toContain('function FirstRoomPage')
    expect(projectsPageSource).not.toContain('Guest mode:')
    expect(projectsPageSource).not.toContain('Sign in to sync')
  })

  it('room cards render real thumbnail collages for multi-video rooms', () => {
    expect(projectCardContentSource).toContain('function RoomMediaCollage')
    expect(projectCardContentSource).toContain('if (item.videos > 1)')
    expect(projectCardContentSource).toContain('<RoomMediaBackdrop item={item} />')
    expect(projectsPageSource).toContain('thumbnailUrls')
  })

  it('room page exposes the playlist and add-video controls in the right rail', () => {
    expect(roomPageSource).toContain('<RoomSidePanel')
    expect(roomPageSource).toContain('sendMediaAdd={sendMediaAdd}')
    expect(roomSidePanelSource).toContain('<RoomVideoList')
    expect(roomSidePanelSource).toContain('<RoomPresence')
    expect(roomVideoListSource).toContain('Queue')
    expect(roomVideoListSource).toContain('Paste video link')
    expect(roomVideoListSource).toContain('Add video')
    expect(roomVideoListSource).toContain('snapshot.mediaItems.map')
    expect(useRoomRealtimeSource).toContain('createMediaAddCommand')
    expect(useRoomRealtimeSource).toContain('createMediaRenameCommand')
    expect(useRoomRealtimeSource).toContain('createMediaRemoveCommand')
    expect(useRoomRealtimeSource).toContain('sendMediaAdd')
    expect(roomVideoListSource).toContain('Rename')
    expect(roomVideoListSource).toContain('Remove from queue')
  })

  it('room chrome omits redundant identity and playback-status labels', () => {
    expect(roomPageSource).not.toContain('const title = snapshot.room.title')
    expect(roomControlBarSource).not.toContain('syncStatus.label')
    expect(roomControlBarSource).not.toContain('role="status"')
  })

  it('room creation form keeps one primary action without a permanent check-link step', () => {
    expect(createRoomFormSource).toContain('Create and open room')
    expect(createRoomFormSource).toContain('Validating link…')
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
