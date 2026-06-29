import type { RoomWorkspaceItem } from '@/modules/projects'

export const appearancePreviewProjects: Array<RoomWorkspaceItem> = [
  {
    id: 'cinema-night',
    title: 'Cinema Night',
    description: 'A weekly room for synced premieres, trailers, and creator commentary.',
    type: 'watch-room',
    status: 'live',
    roomCode: 'CINEMA7',
    members: 18,
    videos: 9,
    lastOpened: 'Today, 18:40',
    ctaText: 'Open room',
    ctaLink: '/room/CINEMA7',
    accent: 'from-primary/55 via-accent/35 to-secondary',
    summary:
      'Host controls are enabled, viewer chat is moderated, and the next shared playback session starts in the evening window.',
  },
  {
    id: 'launch-review',
    title: 'Launch Review',
    description: 'Private review queue for edits, sponsor checks, and team rooms.',
    type: 'watch-room',
    status: 'setup',
    roomCode: 'LAUNCH9',
    members: 6,
    videos: 14,
    lastOpened: 'Yesterday',
    ctaText: 'Review',
    ctaLink: '/room/LAUNCH9',
    accent: 'from-accent/50 via-muted to-primary/25',
    summary:
      'Room setup with three unresolved edit notes, a saved source list, and creator-only playback permissions.',
  },
  {
    id: 'community-replay',
    title: 'Community Replay',
    description: 'Archived audience room with replay-ready moments and shared timestamps.',
    type: 'watch-room',
    status: 'archived',
    roomCode: 'REPLAY4',
    members: 42,
    videos: 5,
    lastOpened: 'May 22',
    ctaText: 'Watch',
    ctaLink: '/room/REPLAY4',
    accent: 'from-secondary via-muted to-accent/45',
    summary:
      'Archived session with preserved playback state, featured moments, and audience presence history for future edits.',
  },
]
