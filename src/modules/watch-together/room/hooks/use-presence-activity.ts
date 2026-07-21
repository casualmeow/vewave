import { useEffect, useRef } from 'react'
import type { RoomPresenceStatus } from '../realtime'

const idleTimeoutMs = 60_000
const activityThrottleMs = 5_000

export function usePresenceActivity(sendPresenceStatus: (status: RoomPresenceStatus) => boolean) {
  const statusRef = useRef<RoomPresenceStatus>('watching')
  const idleTimerRef = useRef<number | null>(null)
  const lastActivitySentRef = useRef(0)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    function setStatus(next: RoomPresenceStatus) {
      if (statusRef.current === next) {
        return
      }

      statusRef.current = next
      sendPresenceStatus(next)
    }

    function clearIdleTimer() {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    function scheduleIdleTimeout() {
      clearIdleTimer()
      idleTimerRef.current = window.setTimeout(() => {
        if (!document.hidden) {
          setStatus('idle')
        }
      }, idleTimeoutMs)
    }

    function handleActivity() {
      if (document.hidden) {
        return
      }

      const now = Date.now()
      if (
        now - lastActivitySentRef.current < activityThrottleMs &&
        statusRef.current === 'watching'
      ) {
        return
      }

      lastActivitySentRef.current = now
      setStatus('watching')
      scheduleIdleTimeout()
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        clearIdleTimer()
        setStatus('away')
      } else {
        handleActivity()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pointermove', handleActivity)
    window.addEventListener('keydown', handleActivity)

    handleVisibilityChange()

    return () => {
      clearIdleTimer()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pointermove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [sendPresenceStatus])
}
