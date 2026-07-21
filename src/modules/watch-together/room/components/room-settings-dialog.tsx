import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useRoomStore, workspacePresetFractions } from '../model'
import { formatPlaybackTime, getRoomSyncStatus } from './room-chrome'
import type { RoomConnectionStatus, RoomPreferences, RoomPreferencesUpdate } from '../model'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import {
  getGetApiRoomsByCodeQueryKey,
  usePatchApiRoomsByCode,
} from '@/core/api/generated/rooms/rooms'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { cn } from '@/shared/lib/utils'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  Slider,
} from '@/shared/ui'

type RoomVisibility = GetApiRoomsByCode200['room']['visibility']
type RoomLifecycleStatus = GetApiRoomsByCode200['room']['status']

const selectClassName =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'

type RoomSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: GetApiRoomsByCode200
  connectionStatus: RoomConnectionStatus
  preferences: RoomPreferences
  updatePreferences: (update: RoomPreferencesUpdate) => void
  resetPreferences: () => void
}

/**
 * Room details and per-user presentation preferences. Secondary metadata
 * (source, visibility, ownership) and technical diagnostics live here so the
 * primary room UI stays focused on the video.
 */
export function RoomSettingsDialog({
  open,
  onOpenChange,
  snapshot,
  connectionStatus,
  preferences,
  updatePreferences,
  resetPreferences,
}: RoomSettingsDialogProps) {
  const queryClient = useQueryClient()
  const updateRoomMetadata = useRoomStore((state) => state.updateRoomMetadata)
  const updateRoomMutation = usePatchApiRoomsByCode()
  const overlay = preferences.overlay
  const playback = snapshot.playback
  const syncStatus = getRoomSyncStatus({ connectionStatus, playback })
  const [title, setTitle] = useState(snapshot.room.title ?? '')
  const [visibility, setVisibility] = useState<RoomVisibility>(snapshot.room.visibility)
  const [status, setStatus] = useState<RoomLifecycleStatus>(snapshot.room.status)
  const [savedTitle, setSavedTitle] = useState(snapshot.room.title ?? '')
  const [savedVisibility, setSavedVisibility] = useState<RoomVisibility>(snapshot.room.visibility)
  const [savedStatus, setSavedStatus] = useState<RoomLifecycleStatus>(snapshot.room.status)
  const [saveError, setSaveError] = useState<string | null>(null)
  const canModerate = snapshot.permissions.canModerate
  const isDirty = title !== savedTitle || visibility !== savedVisibility || status !== savedStatus

  useEffect(() => {
    if (!open) return

    const nextTitle = snapshot.room.title ?? ''
    setTitle(nextTitle)
    setVisibility(snapshot.room.visibility)
    setStatus(snapshot.room.status)
    setSavedTitle(nextTitle)
    setSavedVisibility(snapshot.room.visibility)
    setSavedStatus(snapshot.room.status)
    setSaveError(null)
  }, [open, snapshot.room.status, snapshot.room.title, snapshot.room.visibility])

  async function saveRoomSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canModerate || !isDirty) return

    const data: {
      title?: string | null
      visibility?: RoomVisibility
      status?: RoomLifecycleStatus
    } = {}

    if (title !== savedTitle) data.title = title.trim() || null
    if (visibility !== savedVisibility) data.visibility = visibility
    if (status !== savedStatus) data.status = status

    try {
      const response = await updateRoomMutation.mutateAsync({
        code: snapshot.room.code,
        data,
      })
      const updatedSnapshot: GetApiRoomsByCode200 = {
        ...snapshot,
        room: response.room,
      }
      const nextTitle = response.room.title ?? ''

      queryClient.setQueryData(getGetApiRoomsByCodeQueryKey(snapshot.room.code), updatedSnapshot)
      updateRoomMetadata(response.room)
      setTitle(nextTitle)
      setVisibility(response.room.visibility)
      setStatus(response.room.status)
      setSavedTitle(nextTitle)
      setSavedVisibility(response.room.visibility)
      setSavedStatus(response.room.status)
      setSaveError(null)
      toast.success('Room settings saved')
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to save room settings.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Room settings</DialogTitle>
          <DialogDescription>
            Layout and appearance apply only to you and are saved per account.
          </DialogDescription>
        </DialogHeader>

        <section aria-label="Room management" className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-medium">Room management</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Persistent details shared with everyone in this room.
            </p>
          </div>

          {canModerate ? (
            <form className="grid gap-4" onSubmit={saveRoomSettings}>
              <div className="grid gap-2">
                <Label htmlFor="room-settings-title">Room title</Label>
                <Input
                  id="room-settings-title"
                  value={title}
                  maxLength={180}
                  placeholder="Untitled room"
                  disabled={updateRoomMutation.isPending}
                  onChange={(event) => {
                    setTitle(event.currentTarget.value)
                    setSaveError(null)
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="room-settings-visibility">Visibility</Label>
                  <select
                    id="room-settings-visibility"
                    value={visibility}
                    className={selectClassName}
                    disabled={updateRoomMutation.isPending}
                    onChange={(event) => {
                      setVisibility(event.currentTarget.value as RoomVisibility)
                      setSaveError(null)
                    }}
                  >
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room-settings-status">Room status</Label>
                  <select
                    id="room-settings-status"
                    value={status}
                    className={selectClassName}
                    disabled={updateRoomMutation.isPending}
                    onChange={(event) => {
                      setStatus(event.currentTarget.value as RoomLifecycleStatus)
                      setSaveError(null)
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>
              {saveError ? (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              ) : null}
              <div className="flex items-center justify-end">
                <Button type="submit" disabled={!isDirty || updateRoomMutation.isPending}>
                  {updateRoomMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <MetadataRow label="Room title" value={snapshot.room.title ?? 'Untitled'} />
              <MetadataRow
                label="Visibility"
                value={<span className="capitalize">{snapshot.room.visibility}</span>}
              />
              <MetadataRow
                label="Room status"
                value={<span className="capitalize">{snapshot.room.status}</span>}
              />
              <p className="pt-1 text-xs leading-5 text-muted-foreground">
                Only the room owner or a host can edit these settings.
              </p>
            </div>
          )}
        </section>

        <Separator />

        <section aria-label="Layout" className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Layout</h3>
          <ChoiceRow label="Room view">
            <ChoiceButton
              active={preferences.viewMode === 'immersive'}
              onClick={() => updatePreferences({ viewMode: 'immersive' })}
            >
              Immersive
            </ChoiceButton>
            <ChoiceButton
              active={preferences.viewMode === 'workspace'}
              onClick={() => updatePreferences({ viewMode: 'workspace' })}
            >
              Workspace
            </ChoiceButton>
          </ChoiceRow>
          <ChoiceRow label="Video fit">
            <ChoiceButton
              active={preferences.stageFit === 'contain'}
              onClick={() => updatePreferences({ stageFit: 'contain' })}
            >
              Fit
            </ChoiceButton>
            <ChoiceButton
              active={preferences.stageFit === 'cover'}
              onClick={() => updatePreferences({ stageFit: 'cover' })}
            >
              Fill and crop
            </ChoiceButton>
          </ChoiceRow>
          {preferences.viewMode === 'workspace' ? (
            <ChoiceRow label="Workspace preset">
              {(['conversation', 'balanced', 'cinema'] as const).map((preset) => (
                <ChoiceButton
                  key={preset}
                  active={preferences.workspacePreset === preset}
                  onClick={() =>
                    updatePreferences({
                      workspacePreset: preset,
                      workspaceVideoFraction: workspacePresetFractions[preset],
                    })
                  }
                >
                  <span className="capitalize">{preset}</span>
                </ChoiceButton>
              ))}
              {preferences.workspacePreset === 'custom' ? (
                <span className="self-center text-xs text-muted-foreground">Custom</span>
              ) : null}
            </ChoiceRow>
          ) : null}
        </section>

        <Separator />

        <section aria-label="Overlay appearance" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Overlay appearance</h3>
            <Button type="button" variant="ghost" size="sm" onClick={resetPreferences}>
              Reset to defaults
            </Button>
          </div>
          <PreferenceSlider
            label="Surface opacity"
            value={overlay.opacity}
            min={40}
            max={100}
            unit="%"
            onChange={(opacity) => updatePreferences({ overlay: { opacity } })}
          />
          <PreferenceSlider
            label="Blur intensity"
            value={overlay.blur}
            min={0}
            max={100}
            unit="%"
            onChange={(blur) => updatePreferences({ overlay: { blur } })}
          />
          <PreferenceSlider
            label="Outline intensity"
            value={overlay.outline}
            min={0}
            max={100}
            unit="%"
            onChange={(outline) => updatePreferences({ overlay: { outline } })}
          />
          <PreferenceSlider
            label="Corner radius"
            value={overlay.cornerRadius}
            min={0}
            max={24}
            unit="px"
            onChange={(cornerRadius) => updatePreferences({ overlay: { cornerRadius } })}
          />
          <PreferenceSlider
            label="Auto-hide delay"
            value={overlay.autoHideDelayMs / 1000}
            min={1}
            max={10}
            step={0.5}
            unit="s"
            onChange={(seconds) =>
              updatePreferences({ overlay: { autoHideDelayMs: seconds * 1000 } })
            }
          />
          <ChoiceRow label="Control density">
            <ChoiceButton
              active={overlay.density === 'compact'}
              onClick={() => updatePreferences({ overlay: { density: 'compact' } })}
            >
              Compact
            </ChoiceButton>
            <ChoiceButton
              active={overlay.density === 'comfortable'}
              onClick={() => updatePreferences({ overlay: { density: 'comfortable' } })}
            >
              Comfortable
            </ChoiceButton>
          </ChoiceRow>
        </section>

        <Separator />

        <section aria-label="About this room" className="flex flex-col gap-2 text-sm">
          <h3 className="text-sm font-medium">About this room</h3>
          <MetadataRow
            label="Room code"
            value={<span className="font-mono">{snapshot.room.code}</span>}
          />
          <MetadataRow
            label="Source"
            value={<span className="capitalize">{snapshot.media.provider}</span>}
          />
          <MetadataRow
            label="Your role"
            value={<span className="capitalize">{snapshot.permissions.role}</span>}
          />
          <a
            href={snapshot.media.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Source video
            <ExternalLink className="size-4" />
          </a>
        </section>

        <Separator />

        <section aria-label="Playback and synchronization" className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Playback and synchronization</h3>
          <div className="space-y-1 font-mono text-xs text-muted-foreground">
            <MetadataRow label="Connection" value={connectionStatus} />
            <MetadataRow label="Playback state" value={playback.status} />
            <MetadataRow label="Synchronization" value={syncStatus.label} />
            <MetadataRow
              label="Synced position"
              value={formatPlaybackTime(playback.effectivePositionMs)}
            />
            <MetadataRow label="State version" value={String(playback.version)} />
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}

function ChoiceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </div>
  )
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'secondary' : 'ghost'}
      aria-pressed={active}
      className={cn(!active && 'text-muted-foreground')}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function PreferenceSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </p>
  )
}
