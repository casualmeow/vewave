import type { ProjectItem } from '../types'

export const initialProjects: Array<ProjectItem> = [
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
    accent: 'from-teal-300 via-cyan-200 to-sky-300',
    summary:
      'Host controls are enabled, viewer chat is moderated, and the next shared playback session starts in the evening window.',
  },
  {
    id: 'launch-review',
    title: 'Launch Review',
    description: 'Private review queue for edits, sponsor checks, and team watch sessions.',
    type: 'collection',
    status: 'draft',
    roomCode: 'LAUNCH9',
    members: 6,
    videos: 14,
    lastOpened: 'Yesterday',
    ctaText: 'Review',
    ctaLink: '/room/LAUNCH9',
    accent: 'from-emerald-200 via-lime-100 to-cyan-200',
    summary:
      'Draft project with three unresolved edit notes, two scheduled watch rooms, and creator-only playback permissions.',
  },
  {
    id: 'community-replay',
    title: 'Community Replay',
    description: 'Archived audience room with replay-ready moments and shared timestamps.',
    type: 'event',
    status: 'archived',
    roomCode: 'REPLAY4',
    members: 42,
    videos: 5,
    lastOpened: 'May 22',
    ctaText: 'Watch',
    ctaLink: '/room/REPLAY4',
    accent: 'from-sky-200 via-indigo-100 to-teal-200',
    summary:
      'Archived session with preserved playback state, featured moments, and audience presence history for future edits.',
  },
]
