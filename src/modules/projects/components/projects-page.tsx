import { Link } from '@tanstack/react-router'
import { CloudOff, PlayCircle, Radio } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

import { RoomExpandedContent, RoomMedia } from './project-card-content'
import type { ReactNode } from 'react'
import type {
  RoomWorkspaceItem,
  RoomWorkspaceStatus,
  RoomsDashboardSurfaceId,
  RoomsDashboardSurfaceRenderer,
} from '../types'
import { ResizableCards } from '@/components/resizable-card'
import { getApiRoomsByCode } from '@/core/api/generated/rooms/rooms'
import { useAuthStore } from '@/modules/auth'
import {
  rememberRoomSnapshot,
  useSavedRooms,
  type SavedRoomSummary,
} from '@/modules/watch-together/room'
import { CreateRoomForm } from '@/modules/watch-together/create-room'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui'
import { VewaveLogoMark } from '@/shared/theme'

export type RoomsDashboardViewProps = {
  className?: string
  navigation?: 'live' | 'preview'
  renderSurface?: RoomsDashboardSurfaceRenderer
  rooms: Array<RoomWorkspaceItem>
  showGuestNotice?: boolean
}

export function ProjectsPage() {
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const savedRooms = useSavedRooms(userId)
  const rooms = useMemo(() => savedRooms.map(getSavedRoomWorkspaceItem), [savedRooms])
  useHydrateSavedRoomSnapshots(savedRooms, userId)

  if (status === 'anonymous' && rooms.length === 0) {
    return <FirstRoomPage />
  }

  return <RoomsDashboardView rooms={rooms} showGuestNotice={status === 'anonymous'} />
}

function useHydrateSavedRoomSnapshots(rooms: Array<SavedRoomSummary>, userId: string | null) {
  const requestedCodesRef = useRef(new Set<string>())

  useEffect(() => {
    const roomsToHydrate = rooms.filter(
      (room) =>
        (room.thumbnailUrls.length === 0 || !room.mediaUrl) &&
        !requestedCodesRef.current.has(room.code),
    )

    if (roomsToHydrate.length === 0) {
      return
    }

    const controller = new AbortController()
    let disposed = false

    roomsToHydrate.forEach((room) => {
      requestedCodesRef.current.add(room.code)
      void getApiRoomsByCode(room.code, undefined, controller.signal)
        .then((snapshot) => {
          if (!disposed) {
            rememberRoomSnapshot(snapshot, userId)
          }
        })
        .catch(() => {
          requestedCodesRef.current.delete(room.code)
        })
    })

    return () => {
      disposed = true
      controller.abort()
    }
  }, [rooms, userId])
}

function FirstRoomPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex w-full items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="inline-flex items-center gap-3 font-semibold text-foreground">
          <VewaveLogoMark className="size-9" surfaceToken="background" />
          <span>Vewave</span>
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link to="/sign-in" search={{ redirectTo: undefined }}>
            Sign in
          </Link>
        </Button>
      </header>

      <main className="px-6 pb-20 pt-[clamp(6rem,14vh,10rem)] md:pb-32">
        <div className="mx-auto grid w-full max-w-[35rem] gap-6">
          <section>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Create your first room
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Start a shared watch session from a video or playlist.
            </p>
          </section>

          <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-medium text-foreground">Guest mode:</span> rooms are saved only
              in this browser until you sign in.
            </p>
            <Link
              to="/sign-in"
              search={{ redirectTo: undefined }}
              className="w-fit shrink-0 font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Sign in to sync
            </Link>
          </div>

          <CreateRoomForm variant="firstRun" />
        </div>
      </main>
    </div>
  )
}

export function RoomsDashboardView({
  className,
  navigation = 'live',
  renderSurface,
  rooms,
  showGuestNotice = false,
}: RoomsDashboardViewProps) {
  const activeRoom = useMemo(() => rooms.find((room) => room.status === 'live') ?? null, [rooms])
  const hasRooms = rooms.length > 0
  const wrapSurface = (surface: RoomsDashboardSurfaceId, children: ReactNode) =>
    renderSurface ? renderSurface(surface, children) : children

  const defaultClassName = 'min-h-[calc(100vh-6rem)] overflow-auto px-6 py-8 md:px-10'
  const contentClassName = 'max-w-5xl'
  const gapClassName = hasRooms ? 'gap-6' : 'gap-8'

  return (
    <div className={className ?? defaultClassName}>
      <div className={`mx-auto grid w-full ${contentClassName} ${gapClassName}`}>
        {hasRooms ? (
          <RoomsListState
            activeRoom={activeRoom}
            navigation={navigation}
            renderSurface={renderSurface}
            rooms={rooms}
            wrapSurface={wrapSurface}
          />
        ) : (
          <EmptyRoomsState showGuestNotice={showGuestNotice} wrapSurface={wrapSurface} />
        )}
      </div>
    </div>
  )
}

function EmptyRoomsState({
  showGuestNotice,
  wrapSurface,
}: {
  showGuestNotice: boolean
  wrapSurface: (surface: RoomsDashboardSurfaceId, children: ReactNode) => ReactNode
}) {
  return (
    <>
      {wrapSurface(
        'hero',
        <section className="border-b border-border/70 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Rooms</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Create your first room
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Rooms keep the video link, invite link, participants, and playback state in one place.
          </p>
        </section>,
      )}

      {wrapSurface(
        'roomList',
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border/70 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Recent rooms
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rooms you start or open will appear here.
              </p>
            </div>
            <StartRoomDialog />
          </div>

          <div className="grid min-h-[22rem] place-items-center px-6 py-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid size-12 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Radio className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                You do not have any rooms yet.
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start a room from a video link. After it opens, it will appear here as a recent
                room.
              </p>
            </div>
          </div>
        </section>,
      )}

      {showGuestNotice ? <GuestModeNotice /> : null}
    </>
  )
}

function RoomsListState({
  activeRoom,
  navigation,
  renderSurface,
  rooms,
  wrapSurface,
}: {
  activeRoom: RoomWorkspaceItem | null
  navigation: 'live' | 'preview'
  renderSurface?: RoomsDashboardSurfaceRenderer
  rooms: Array<RoomWorkspaceItem>
  wrapSurface: (surface: RoomsDashboardSurfaceId, children: ReactNode) => ReactNode
}) {
  return (
    <>
      {wrapSurface(
        'hero',
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Rooms</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Open a saved room or start a new room from a video link.
            </p>
          </div>
          <StartRoomDialog />
        </section>,
      )}

      {activeRoom ? <ContinueWatchingCard navigation={navigation} room={activeRoom} /> : null}

      {wrapSurface(
        'roomList',
        <section className="grid gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Recent rooms</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rooms keep the video link, session state, and latest opened status together.
            </p>
          </div>

          <ResizableCards
            items={rooms}
            presentation="media"
            animationPreset="surface-grow"
            variant="ghost"
            size="default"
            actionVariant="default"
            className="rounded-lg border border-border bg-card p-4"
            listClassName="mx-0 max-w-none gap-4 md:grid-cols-2 xl:grid-cols-3"
            compactSize={{
              width: '100%',
              minHeight: '20rem',
            }}
            expandedSize={{
              initialWidth: 720,
              initialHeight: 620,
              minWidth: 420,
              minHeight: 420,
              maxWidth: 980,
              maxHeight: 780,
              viewportPadding: 24,
            }}
            renderMedia={(item) => <RoomMedia item={item} renderSurface={renderSurface} />}
            renderAction={(item, state) => renderRoomAction({ item, navigation, state })}
            renderContent={(item) => (
              <RoomExpandedContent item={item} renderSurface={renderSurface} />
            )}
          />
        </section>,
      )}
    </>
  )
}

function StartRoomDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="w-fit rounded-md">
          <PlayCircle className="size-4" />
          Start room
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Start a room</DialogTitle>
          <DialogDescription>
            Add a room name and video link. You can invite viewers after the room opens.
          </DialogDescription>
        </DialogHeader>
        <CreateRoomForm variant="plain" />
      </DialogContent>
    </Dialog>
  )
}

function GuestModeNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card/80 p-3 text-sm text-muted-foreground shadow-sm">
      <span className="mt-0.5 hidden size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground sm:grid">
        <CloudOff className="size-4" />
      </span>
      <p>
        <span className="font-medium text-foreground">Guest mode:</span> rooms are saved only in
        this browser until you sign in.
      </p>
    </div>
  )
}

function ContinueWatchingCard({
  navigation,
  room,
}: {
  navigation: 'live' | 'preview'
  room: RoomWorkspaceItem
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <PlayCircle className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Continue watching</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {room.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Room {room.roomCode} · {room.members} viewer{room.members === 1 ? '' : 's'} ·{' '}
              {room.videos > 0
                ? `${room.videos} video link${room.videos === 1 ? '' : 's'}`
                : 'video link pending'}
            </p>
          </div>
        </div>
        {navigation === 'live' ? (
          <Button asChild className="w-fit rounded-md">
            <Link to="/room/$code" params={{ code: room.roomCode }}>
              Open room
            </Link>
          </Button>
        ) : (
          <Button type="button" className="w-fit rounded-md">
            Open room
          </Button>
        )}
      </div>
    </section>
  )
}

function renderRoomAction({
  item,
  navigation,
  state,
}: {
  item: RoomWorkspaceItem
  navigation: 'live' | 'preview'
  state: { expanded: boolean }
}) {
  if (!state.expanded) return null

  if (navigation !== 'live') {
    return (
      <Button type="button" className="rounded-md">
        {item.ctaText ?? 'Open room'}
      </Button>
    )
  }

  return (
    <Button asChild className="rounded-md">
      <Link to="/room/$code" params={{ code: item.roomCode }}>
        {item.ctaText ?? 'Open room'}
      </Link>
    </Button>
  )
}

function getSavedRoomWorkspaceItem(room: SavedRoomSummary): RoomWorkspaceItem {
  const status = getSavedRoomStatus(room)
  const thumbnailUrls = room.thumbnailUrls.length > 0 ? room.thumbnailUrls : []
  const videoCount = room.videoCount ?? (room.provider ? Math.max(1, thumbnailUrls.length) : 0)

  return {
    id: `saved-${room.code}`,
    title: room.title,
    description: getSavedRoomDescription(room),
    src: thumbnailUrls[0] ?? room.thumbnailUrl ?? undefined,
    thumbnailUrls,
    imageAlt: room.mediaTitle
      ? `Video preview for ${room.mediaTitle}`
      : `Video preview for room ${room.code}`,
    type: 'watch-room',
    status,
    roomCode: room.code,
    members: room.role ? 1 : 0,
    videos: videoCount,
    lastOpened: formatLastOpened(room.lastOpenedAt),
    ctaText: status === 'archived' ? 'Review room' : 'Open room',
    ctaLink: `/room/${room.code}`,
    accent: getSavedRoomAccent(room, status),
    summary: getSavedRoomSummary(room, status),
  }
}

function getSavedRoomStatus(room: SavedRoomSummary): RoomWorkspaceStatus {
  if (room.status === 'active') return 'live'
  if (room.status === 'ended') return 'archived'

  return 'setup'
}

function getSavedRoomDescription(room: SavedRoomSummary) {
  const role = room.role ? capitalizeLabel(room.role) : 'Saved'
  const videoCount = getSavedRoomVideoCount(room)
  const provider = room.provider
    ? `${capitalizeLabel(room.provider)} ${videoCount === 1 ? 'video link' : 'video links'}`
    : 'video link pending'
  const mediaTitle = videoCount === 1 && room.mediaTitle ? ` · ${room.mediaTitle}` : ''

  return `${role} room · ${provider}${mediaTitle}`
}

function getSavedRoomAccent(room: SavedRoomSummary, status: RoomWorkspaceStatus) {
  if (status === 'archived') return 'from-muted via-secondary to-muted'
  if (room.role === 'owner' || room.role === 'host')
    return 'from-primary/45 via-accent/25 to-secondary'

  return 'from-muted via-secondary to-accent/35'
}

function getSavedRoomSummary(room: SavedRoomSummary, status: RoomWorkspaceStatus) {
  const roomState = status === 'live' ? 'active' : status === 'archived' ? 'ended' : 'saved'
  const videoCount = getSavedRoomVideoCount(room)
  const videoLink =
    videoCount > 1
      ? `${videoCount} ${capitalizeLabel(room.provider ?? 'video')} video links`
      : room.mediaUrl
        ? `${capitalizeLabel(room.provider ?? 'video')} link (${room.mediaUrl})`
        : room.provider
          ? `${capitalizeLabel(room.provider)} video link`
          : 'video link details pending'
  const visibility = room.visibility ? `${room.visibility} visibility` : 'visibility not set'

  return `This ${roomState} room keeps its ${videoLink}, ${visibility}, and latest opened state together so you can return without rebuilding the session.`
}

function getSavedRoomVideoCount(room: SavedRoomSummary) {
  return room.videoCount ?? (room.provider ? Math.max(1, room.thumbnailUrls.length) : 0)
}

function capitalizeLabel(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}

function formatLastOpened(value: string) {
  const timestamp = Date.parse(value)

  if (!Number.isFinite(timestamp)) {
    return 'Recently'
  }

  const diffMs = Date.now() - timestamp
  const minuteMs = 60_000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (diffMs < minuteMs) return 'Just now'
  if (diffMs < hourMs) return `${Math.max(1, Math.floor(diffMs / minuteMs))} min ago`
  if (diffMs < dayMs) return `${Math.max(1, Math.floor(diffMs / hourMs))} hr ago`
  if (diffMs < 7 * dayMs) {
    const days = Math.max(1, Math.floor(diffMs / dayMs))

    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(timestamp))
}

export type ProjectsDashboardViewProps = RoomsDashboardViewProps
export { RoomsDashboardView as ProjectsDashboardView }
