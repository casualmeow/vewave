import { ArrowRight, HelpCircle, Link2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useCreateRoom } from '../hooks/use-create-room'
import { useRoomPreferences, workspacePresetFractions } from '../../room/model'
import { RoomDraftPreview } from './room-draft-preview'
import { VideoQueueEditor } from './video-queue-editor'
import type { RoomPreferences, RoomPreferencesUpdate } from '../../room/model'
import { SegmentedControl } from '@/modules/settings/settings-primitives'
import { Button, GlassSurface, Input, Label, Tooltip } from '@/shared/ui'
import './create-room-workspace.css'
import { useAuthStore } from '@/modules/auth/model'

export function CreateRoomPage() {
  const userId = useAuthStore((state) => state.user?.id ?? 'guest')
  return <CreateRoomWorkspace key={userId} />
}

function CreateRoomWorkspace() {
  const creation = useCreateRoom()
  const { preferences, updatePreferences } = useRoomPreferences()
  const [view, setView] = useState<RoomPreferences>(preferences)
  const [title, setTitle] = useState('')
  const [links, setLinks] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const invalid = creation.draft.videos.some((video) => video.status !== 'ready')
  const preview = creation.draft.videos.find((video) => video.id === creation.draft.selectedId)

  function updateView(update: RoomPreferencesUpdate) {
    if (creation.locked) return
    setView((current) => ({
      ...current,
      ...update,
      overlay: { ...current.overlay, ...('overlay' in update ? update.overlay : {}) },
    }))
  }

  return (
    <div className="create-room-container">
      <div className="create-room-page flex min-h-full flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create a room</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Something to watch. People to share it with.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={helpOpen}
            aria-controls="create-room-help"
            onClick={() => setHelpOpen((open) => !open)}
          >
            <HelpCircle className="size-4" />
            How it works
          </Button>
        </header>
        {helpOpen && (
          <div
            id="create-room-help"
            className="mb-5 grid shrink-0 gap-2 rounded-lg bg-accent/50 px-4 py-3 text-sm sm:grid-cols-3"
          >
            <p>
              <strong>1. Add videos.</strong> Paste one link or a list.
            </p>
            <p>
              <strong>2. Make it yours.</strong> Choose how you want to watch.
            </p>
            <p>
              <strong>3. Invite friends.</strong> Share the link from inside your room.
            </p>
          </div>
        )}
        <div className="create-room-columns grid min-h-0 flex-1 gap-6">
          <div className="create-room-workbench flex min-h-0 min-w-0 flex-col gap-5">
            <div className="create-room-preview flex min-h-72 flex-col [&>section]:flex-1">
              <RoomDraftPreview
                video={preview}
                videos={creation.draft.videos}
                onSelectVideo={creation.queue.select}
                title={title}
                preferences={view}
                onPreferencesChange={updateView}
              />
            </div>
            <form
              className="shrink-0"
              onSubmit={(event) => {
                event.preventDefault()
                if (creation.queue.add(links)) setLinks('')
              }}
            >
              <Label htmlFor="room-video-links" className="mb-2 flex items-center gap-2">
                <Link2 className="size-4 text-muted-foreground" />
                Add videos
              </Label>
              <div className="flex items-end gap-2 rounded-lg bg-background/65 p-2 ring-1 ring-border focus-within:ring-ring">
                <textarea
                  id="room-video-links"
                  value={links}
                  onChange={(event) => setLinks(event.target.value)}
                  disabled={creation.locked}
                  rows={2}
                  placeholder="Paste a video link, or several links on separate lines"
                  aria-describedby="room-video-support"
                  className="min-w-0 flex-1 resize-y bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <Button type="submit" size="sm" disabled={creation.locked || !links.trim()}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              <p id="room-video-support" className="mt-2 text-xs leading-5 text-muted-foreground">
                YouTube plays together here. Vimeo and TikTok links open on their own sites.
              </p>
            </form>
            <div className="shrink-0">
              <VideoQueueEditor
                queue={creation.queue}
                draft={creation.draft}
                locked={creation.locked}
              />
            </div>
          </div>
          <GlassSurface
            role="form"
            elevation="embedded"
            className="flex min-h-0 flex-col rounded-2xl"
          >
            <div className="create-room-settings space-y-7 p-5 sm:p-6">
              <div>
                <h2 className="text-base font-semibold">Make yourself at home</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Name the room and choose your view.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-room-title">
                  Room name <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="create-room-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={180}
                  readOnly={creation.locked}
                  placeholder="Friday movie night"
                />
              </div>
              <fieldset disabled={creation.locked} className="min-w-0 space-y-3">
                <legend className="mb-2 text-sm font-medium">Your view</legend>
                <SegmentedControl
                  ariaLabel="Viewing layout"
                  value={view.viewMode}
                  options={[
                    { value: 'immersive', label: 'Immersive' },
                    { value: 'workspace', label: 'Workspace' },
                  ]}
                  onChange={(viewMode) => updateView({ viewMode })}
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  {view.viewMode === 'immersive'
                    ? 'A bigger stage. Open the queue and chat when you need them.'
                    : 'Keep the video, queue, and conversation side by side.'}
                </p>
                {view.viewMode === 'workspace' && (
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-medium">Video and panel balance</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['conversation', 'balanced', 'cinema'] as const).map((preset) => (
                        <Tooltip
                          key={preset}
                          text={
                            preset === 'conversation'
                              ? 'More room for the conversation'
                              : preset === 'cinema'
                                ? 'More space for the video'
                                : 'An even balance of watching and chatting'
                          }
                          delayDuration={350}
                        >
                          <Button
                            variant={view.workspacePreset === preset ? 'secondary' : 'ghost'}
                            size="sm"
                            aria-pressed={view.workspacePreset === preset}
                            className="px-1 text-xs capitalize"
                            onClick={() =>
                              updateView({
                                workspacePreset: preset,
                                workspaceVideoFraction: workspacePresetFractions[preset],
                              })
                            }
                          >
                            {preset}
                          </Button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
                <p className="pt-2 text-xs leading-5 text-muted-foreground">
                  This changes your view only. You can adjust it again inside the room.
                </p>
              </fieldset>
              <div className="space-y-2 pt-2 text-sm">
                <p className="font-medium">Once you’re in</p>
                <p className="leading-6 text-muted-foreground">
                  Use Invite to bring your friends. Your queue will be ready, and the host controls
                  playback for everyone.
                </p>
              </div>
            </div>
            <div className="create-room-actions sticky bottom-0 z-10 mt-auto rounded-b-2xl bg-background/95 p-5 sm:p-6">
              {creation.error && (
                <p role="alert" className="mb-3 text-sm text-destructive">
                  {creation.error}
                </p>
              )}
              <Button
                className="w-full gap-2"
                disabled={
                  creation.isPending ||
                  (creation.phase !== 'created' &&
                    (!creation.draft.videos.length || invalid || Boolean(links.trim())))
                }
                onClick={() => void creation.submit(title, () => updatePreferences(view))}
              >
                {creation.phase === 'creating'
                  ? 'Creating room…'
                  : creation.phase === 'opening'
                    ? 'Opening room…'
                    : creation.phase === 'created'
                      ? 'Open your room'
                      : 'Start room'}
                <ArrowRight className="size-4" />
              </Button>
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {links.trim()
                  ? 'Add your pasted links to the queue first.'
                  : invalid
                    ? 'Check the links that need attention.'
                    : creation.draft.videos.length
                      ? `${creation.draft.videos.length} ${creation.draft.videos.length === 1 ? 'video' : 'videos'} ready · Invite friends after opening`
                      : 'Add a video to get started.'}
              </p>
            </div>
          </GlassSurface>
        </div>
      </div>
    </div>
  )
}
