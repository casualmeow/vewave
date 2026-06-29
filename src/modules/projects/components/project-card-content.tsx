import { Clock3, PlayCircle, UsersRound, Video } from 'lucide-react'
import type { ReactNode } from 'react'
import type { RoomWorkspaceItem, RoomsDashboardSurfaceRenderer } from '../types'

function wrapSurface(
  renderSurface: RoomsDashboardSurfaceRenderer | undefined,
  surface: Parameters<RoomsDashboardSurfaceRenderer>[0],
  children: ReactNode,
) {
  return renderSurface ? renderSurface(surface, children) : children
}

function getRoomStatusLabel(item: RoomWorkspaceItem) {
  if (item.status === 'setup') return 'Saved'
  if (item.status === 'live') return 'Live'

  return 'Ended'
}

function getRoomThumbnailUrls(item: RoomWorkspaceItem) {
  if (item.thumbnailUrls?.length) {
    return item.thumbnailUrls
  }

  return item.src ? [item.src] : []
}

function RoomMediaBackdrop({ item }: { item: RoomWorkspaceItem }) {
  const thumbnailUrls = getRoomThumbnailUrls(item)
  const thumbnailUrl = thumbnailUrls[0]

  if (item.videos > 1) {
    return <RoomMediaCollage item={item} thumbnailUrls={thumbnailUrls} />
  }

  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={item.imageAlt ?? ''}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    )
  }

  return <RoomMediaFallbackPattern />
}

function RoomMediaFallbackPattern() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--background) 20%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--background) 20%, transparent) 1px, transparent 1px)',
          backgroundSize: '2.4rem 2.4rem',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,color-mix(in_srgb,var(--background)_78%,transparent),transparent_34%),linear-gradient(to_bottom,transparent_44%,color-mix(in_srgb,var(--foreground)_18%,transparent))]" />
    </>
  )
}

function RoomMediaCollage({
  item,
  thumbnailUrls,
}: {
  item: RoomWorkspaceItem
  thumbnailUrls: Array<string>
}) {
  const tileCount = Math.min(4, Math.max(2, item.videos))
  const visibleUrls = thumbnailUrls.slice(0, tileCount)
  const hiddenCount = Math.max(0, item.videos - Math.min(item.videos, visibleUrls.length))

  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-1.5 bg-foreground/10 p-1.5">
      {Array.from({ length: tileCount }).map((_, index) => {
        const url = visibleUrls[index]
        const showHiddenCount = hiddenCount > 0 && index === tileCount - 1

        return (
          <div
            key={`${url ?? 'placeholder'}-${index}`}
            className="relative min-h-0 overflow-hidden rounded-lg bg-background/20"
          >
            {url ? (
              <img
                src={url}
                alt={item.imageAlt ?? ''}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <RoomMediaFallbackPattern />
            )}
            {showHiddenCount ? (
              <div className="absolute inset-0 grid place-items-center bg-foreground/55 text-lg font-semibold text-background backdrop-blur-[2px]">
                +{hiddenCount}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function RoomMedia({
  item,
  renderSurface,
}: {
  item: RoomWorkspaceItem
  renderSurface?: RoomsDashboardSurfaceRenderer
}) {
  return wrapSurface(
    renderSurface,
    'roomMedia',
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${item.accent}`}>
      <RoomMediaBackdrop item={item} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/10 to-foreground/45" />

      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate rounded-full bg-card/72 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            {getRoomStatusLabel(item)}
          </span>
          <span className="shrink-0 rounded-full bg-background/72 px-2.5 py-1 text-[0.68rem] font-semibold text-foreground shadow-sm backdrop-blur">
            {item.videos > 0
              ? `${item.videos} video link${item.videos === 1 ? '' : 's'}`
              : 'No video link'}
          </span>
        </div>

        <div className="grid place-items-center">
          <div className="grid size-14 place-items-center rounded-full border border-background/40 bg-background/62 text-foreground shadow-[0_18px_42px_color-mix(in_srgb,var(--foreground)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur-xl">
            <PlayCircle className="size-7" />
          </div>
        </div>

        <div className="rounded-lg border border-background/35 bg-background/58 p-3 text-foreground shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
            <span className="truncate">Room {item.roomCode}</span>
            <span className="shrink-0">Room</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/12">
            <span className="block h-full w-2/3 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>,
  )
}

export function RoomExpandedContent({
  item,
  renderSurface,
}: {
  item: RoomWorkspaceItem
  renderSurface?: RoomsDashboardSurfaceRenderer
}) {
  return wrapSurface(
    renderSurface,
    'roomDetails',
    <div className="grid gap-5">
      <p>{item.summary}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Viewers', value: item.members, icon: UsersRound },
          { label: 'Video links', value: item.videos, icon: Video },
          { label: 'Opened', value: item.lastOpened, icon: Clock3 },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
              <Icon className="size-4 text-muted-foreground" />
              <div className="mt-3 text-lg font-semibold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>,
  )
}

export { RoomExpandedContent as ProjectExpandedContent, RoomMedia as ProjectMedia }
