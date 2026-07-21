import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import type { FormEvent } from 'react'
import type { ChatMessage } from '../model'
import { Button, Input } from '@/shared/ui'

type RoomChatProps = {
  messages: Array<ChatMessage>
  canChat: boolean
  sendChatMessage: (body: string) => boolean
}

export function RoomChat({ messages, canChat, sendChatMessage }: RoomChatProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current

    if (!list) {
      return
    }

    list.scrollTop = list.scrollHeight
  }, [messages.length])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()

    if (!body) {
      return
    }

    if (sendChatMessage(body)) {
      setDraft('')
    }
  }

  return (
    <section aria-label="Chat" className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 pr-2">
        {messages.length ? (
          messages.map((message) => (
            <div key={message.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-foreground">{message.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-0.5 break-words whitespace-pre-wrap text-foreground/90">
                {message.body}
              </p>
            </div>
          ))
        ) : (
          <p className="pt-6 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        )}
      </div>
      <form className="mt-3 flex shrink-0 items-center gap-2" onSubmit={submit}>
        <Input
          disabled={!canChat}
          placeholder={canChat ? 'Send a message' : 'Chat is unavailable'}
          value={draft}
          maxLength={2000}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canChat || !draft.trim()}
          className="shrink-0"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </section>
  )
}
