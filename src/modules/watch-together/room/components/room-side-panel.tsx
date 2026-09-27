import { History, ListVideo, MessageCircle, Users } from 'lucide-react'
import { RoomChat } from './room-chat'
import { RoomHistory } from './room-history'
import { RoomPresence } from './room-presence'
import { RoomVideoList } from './room-video-list'
import type { PresenceMember } from '../realtime'
import type { ChatMessage, RoomHistoryItem } from '../model'
import type { GetApiRoomsByCode200 } from '@/core/api/generated/model'
import { cn } from '@/shared/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'

export type RoomPanelTab = 'queue' | 'chat' | 'people' | 'history'

type RoomSidePanelProps = {
  snapshot: GetApiRoomsByCode200
  canControl: boolean
  canAddMedia: boolean
  canChat: boolean
  sendMediaAdd: (url: string) => boolean
  sendMediaRemove: (mediaItemId: string) => boolean
  sendMediaRename: (mediaItemId: string, title: string) => boolean
  sendMediaSelect: (mediaItemId: string) => boolean
  sendChatMessage: (body: string) => boolean
  chatMessages: Array<ChatMessage>
  roomHistory: Array<RoomHistoryItem>
  presence: Array<PresenceMember>
  tab: RoomPanelTab
  onTabChange: (tab: RoomPanelTab) => void
  className?: string
}

export function RoomSidePanel({
  snapshot,
  canControl,
  canAddMedia,
  canChat,
  sendMediaAdd,
  sendMediaRemove,
  sendMediaRename,
  sendMediaSelect,
  sendChatMessage,
  chatMessages,
  roomHistory,
  presence,
  tab,
  onTabChange,
  className,
}: RoomSidePanelProps) {
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => onTabChange(value as RoomPanelTab)}
      className={cn('flex h-full min-h-0 flex-col gap-0', className)}
    >
      <TabsList className="grid w-full shrink-0 grid-cols-4">
        <TabsTrigger value="queue">
          <ListVideo className="size-4" />
          <span className="sr-only sm:not-sr-only">Queue</span>
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageCircle className="size-4" />
          <span className="sr-only sm:not-sr-only">Chat</span>
        </TabsTrigger>
        <TabsTrigger value="people">
          <Users className="size-4" />
          <span className="sr-only sm:not-sr-only">People</span>
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="size-4" />
          <span className="sr-only sm:not-sr-only">History</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="queue" className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <RoomVideoList
          canControl={canControl}
          canAddMedia={canAddMedia}
          sendMediaAdd={sendMediaAdd}
          sendMediaRemove={sendMediaRemove}
          sendMediaRename={sendMediaRename}
          sendMediaSelect={sendMediaSelect}
          snapshot={snapshot}
        />
      </TabsContent>
      <TabsContent value="chat" className="mt-3 min-h-0 flex-1">
        <RoomChat messages={chatMessages} canChat={canChat} sendChatMessage={sendChatMessage} />
      </TabsContent>
      <TabsContent value="people" className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <RoomPresence members={presence} />
      </TabsContent>
      <TabsContent value="history" className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <RoomHistory
          items={roomHistory}
          canControl={canControl}
          sendMediaSelect={sendMediaSelect}
        />
      </TabsContent>
    </Tabs>
  )
}
