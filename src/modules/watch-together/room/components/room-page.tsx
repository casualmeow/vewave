import { useRef, useState } from 'react'
import {
  usePresenceActivity,
  useRoomChatHistory,
  useRoomHistory,
  useRoomRealtime,
  useRoomSnapshot,
} from '../hooks'
import { useRoomPreferences, useRoomStore } from '../model'
import { getRoomOverlayStyle } from './room-chrome'
import { RoomDrawer, useIsDesktop } from './room-drawer'
import { RoomHeader, RoomMenu, RoomParticipantsButton } from './room-header'
import { RoomInvite } from './room-invite'
import { RoomSettingsDialog } from './room-settings-dialog'
import { RoomSidebarToggle } from './room-sidebar-toggle'
import { RoomSidePanel, type RoomPanelTab } from './room-side-panel'
import { RoomStage } from './room-stage'
import { RoomWorkspace } from './room-workspace'
import type { EmbeddedPlayerController, EmbeddedPlayerInfo } from '../player'
import { getApiErrorMessage } from '@/core/api/http/errors'

type RoomPageProps = {
  code: string
}

export function RoomPage({ code }: RoomPageProps) {
  const query = useRoomSnapshot(code)
  useRoomChatHistory(code)
  useRoomHistory(code)
  const {
    sendChatMessage,
    sendMediaAdd,
    sendMediaRemove,
    sendMediaRename,
    sendMediaSelect,
    sendPlaybackCommand,
    sendPresenceStatus,
  } = useRoomRealtime(code)
  usePresenceActivity(sendPresenceStatus)
  const storedSnapshot = useRoomStore((state) => state.snapshot)
  const snapshot =
    storedSnapshot?.room.code.toLowerCase() === code.toLowerCase()
      ? storedSnapshot
      : (query.data ?? null)
  const playback = useRoomStore((state) => state.playback)
  const presence = useRoomStore((state) => state.presence)
  const chatMessages = useRoomStore((state) => state.chatMessages)
  const roomHistory = useRoomStore((state) => state.roomHistory)
  const connectionStatus = useRoomStore((state) => state.connectionStatus)

  const { preferences, updatePreferences, resetPreferences } = useRoomPreferences()
  const isDesktop = useIsDesktop()
  const [playerInfo, setPlayerInfo] = useState<EmbeddedPlayerInfo | null>(null)
  const playerController = useRef<EmbeddedPlayerController | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<RoomPanelTab>('queue')

  if (query.isPending && !snapshot) {
    return (
      <div className="grid min-h-full place-items-center px-6 text-sm text-muted-foreground">
        Loading room...
      </div>
    )
  }

  if (query.isError || !snapshot) {
    return (
      <div className="grid min-h-full place-items-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Room unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {getApiErrorMessage(query.error, 'The room could not be loaded.')}
          </p>
        </div>
      </div>
    )
  }

  const canControl = snapshot.permissions.canControlPlayback
  const canAddMedia = snapshot.permissions.canAddMedia
  const canChat = snapshot.permissions.canChat
  const participantCount = Math.max(presence.length, 1)
  const overlayStyle = getRoomOverlayStyle(preferences.overlay)
  const activePlayback = playback ?? snapshot.playback

  function openPeople() {
    setPanelTab('people')
    setDrawerOpen(true)
  }

  const sidePanel = (
    <RoomSidePanel
      snapshot={snapshot}
      canControl={canControl}
      canAddMedia={canAddMedia}
      canChat={canChat}
      sendMediaAdd={sendMediaAdd}
      sendMediaRemove={sendMediaRemove}
      sendMediaRename={sendMediaRename}
      sendMediaSelect={sendMediaSelect}
      sendChatMessage={sendChatMessage}
      chatMessages={chatMessages}
      roomHistory={roomHistory}
      presence={presence}
      tab={panelTab}
      onTabChange={setPanelTab}
    />
  )

  const settingsDialog = (
    <RoomSettingsDialog
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
      snapshot={snapshot}
      connectionStatus={connectionStatus}
      preferences={preferences}
      updatePreferences={updatePreferences}
      resetPreferences={resetPreferences}
    />
  )

  if (preferences.viewMode === 'immersive') {
    return (
      <div className="relative flex h-full min-h-0">
        <RoomStage
          className="min-h-0 min-w-0 flex-1 rounded-[2rem] focus-visible:ring-inset fullscreen:rounded-none"
          media={snapshot.media}
          playback={activePlayback}
          connectionStatus={connectionStatus}
          canControl={canControl}
          sendPlaybackCommand={sendPlaybackCommand}
          playerInfo={playerInfo}
          onPlayerInfo={setPlayerInfo}
          playerController={playerController}
          preferences={preferences}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleDrawer={() => setDrawerOpen((open) => !open)}
          drawerOpen={drawerOpen}
          topLeft={<RoomSidebarToggle variant="media" style={overlayStyle} />}
          topRight={({ setInteracting }) => (
            <div className="flex h-9 items-center gap-1 px-1" style={overlayStyle}>
              <RoomParticipantsButton
                count={participantCount}
                variant="media"
                onClick={openPeople}
              />
              <RoomInvite snapshot={snapshot} variant="media" onOpenChange={setInteracting} />
              <RoomMenu
                snapshot={snapshot}
                viewMode={preferences.viewMode}
                onViewModeChange={(viewMode) => updatePreferences({ viewMode })}
                onOpenSettings={() => setSettingsOpen(true)}
                variant="media"
                onOpenChange={setInteracting}
              />
            </div>
          )}
        />
        <RoomDrawer
          open={drawerOpen}
          pinned={preferences.drawerPinned}
          onClose={() => setDrawerOpen(false)}
          onTogglePinned={() => updatePreferences({ drawerPinned: !preferences.drawerPinned })}
          isDesktop={isDesktop}
        >
          {sidePanel}
        </RoomDrawer>
        {settingsDialog}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col px-3 pt-1 pb-3 md:px-4 md:pb-4">
      <RoomHeader
        snapshot={snapshot}
        participantCount={participantCount}
        viewMode={preferences.viewMode}
        onViewModeChange={(viewMode) => updatePreferences({ viewMode })}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPeople={() => setPanelTab('people')}
      />
      <div className="min-h-0 flex-1">
        <RoomWorkspace
          preferences={preferences}
          updatePreferences={updatePreferences}
          stage={
            <RoomStage
              media={snapshot.media}
              playback={activePlayback}
              connectionStatus={connectionStatus}
              canControl={canControl}
              sendPlaybackCommand={sendPlaybackCommand}
              playerInfo={playerInfo}
              onPlayerInfo={setPlayerInfo}
              playerController={playerController}
              preferences={preferences}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          }
          panel={sidePanel}
        />
      </div>
      {settingsDialog}
    </div>
  )
}
