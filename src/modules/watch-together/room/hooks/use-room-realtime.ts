import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useRoomStore } from '../model'
import {
  buildRoomRealtimeUrl,
  createPlaybackCommand,
  parseServerRoomEvent,
  serializeClientRoomEvent,
  type PlaybackCommandAction,
} from '../realtime'
import { useAuthStore } from '@/modules/auth'

const heartbeatMs = 25_000
const maxReconnectAttempts = 5

export function useRoomRealtime(code: string) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const applyServerEvent = useRoomStore((state) => state.applyServerEvent)
  const setConnectionStatus = useRoomStore((state) => state.setConnectionStatus)
  const setLastError = useRoomStore((state) => state.setLastError)
  const connectionStatus = useRoomStore((state) => state.connectionStatus)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const heartbeatTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let disposed = false
    let reconnectAttempts = 0

    function clearTimers() {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
    }

    function connect() {
      if (disposed) {
        return
      }

      clearTimers()
      setConnectionStatus('connecting')

      const socket = new WebSocket(buildRoomRealtimeUrl(code, accessToken))
      socketRef.current = socket

      socket.addEventListener('open', () => {
        reconnectAttempts = 0
        setConnectionStatus('open')
        setLastError(null)
        heartbeatTimerRef.current = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              serializeClientRoomEvent({
                type: 'room.ping',
                payload: { clientTimeMs: Date.now() },
              }),
            )
          }
        }, heartbeatMs)
      })

      socket.addEventListener('message', (message) => {
        try {
          const event = parseServerRoomEvent(JSON.parse(String(message.data)))

          if (!event) {
            return
          }

          applyServerEvent(event)

          if (event.type === 'command.rejected') {
            toast.error(event.payload.message)
          }

          if (event.type === 'error') {
            toast.error(event.payload.message)
          }
        } catch {
          setLastError('Received an invalid realtime event.')
        }
      })

      socket.addEventListener('error', () => {
        setConnectionStatus('error')
        setLastError('Realtime connection error.')
      })

      socket.addEventListener('close', () => {
        clearTimers()

        if (disposed) {
          setConnectionStatus('closed')
          return
        }

        if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionStatus('closed')
          setLastError('Realtime connection closed.')
          return
        }

        reconnectAttempts += 1
        setConnectionStatus('connecting')
        reconnectTimerRef.current = window.setTimeout(
          connect,
          Math.min(1_000 * 2 ** reconnectAttempts, 10_000),
        )
      })
    }

    connect()

    return () => {
      disposed = true
      clearTimers()
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [accessToken, applyServerEvent, code, setConnectionStatus, setLastError])

  const sendPlaybackCommand = useCallback((action: PlaybackCommandAction, positionMs?: number) => {
    const socket = socketRef.current

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.send(serializeClientRoomEvent(createPlaybackCommand(action, positionMs)))
    return true
  }, [])

  return {
    connectionStatus,
    sendPlaybackCommand,
  }
}
