import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  consumeRoomGuideCreation,
  hasRoomGuideCreation,
  getPendingRoomGuideSave,
  readRoomGuide,
  saveRoomGuideProgress,
} from '../model/room-guide'
import type { RoomGuideOutcome } from '../model/room-guide'
import { getApiProfileMe } from '@/core/api/generated/profile/profile'
import { useAuthStore } from '@/modules/auth/model'

export function useRoomGuide(code: string, ready: boolean) {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const [step, setStep] = useState<number | null>(null)
  const stepRef = useRef(step)
  stepRef.current = step
  const returnFocus = useRef<HTMLElement | null>(null)

  const persist = useCallback((owner: string, status: RoomGuideOutcome) => {
    void saveRoomGuideProgress(owner, status).catch(() => {
      if (useAuthStore.getState().user?.id !== owner) return
      toast.error('Your guide progress has not synced yet.', {
        action: { label: 'Retry', onClick: () => persist(owner, status) },
      })
    })
  }, [])

  const start = useCallback(() => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setStep(0)
  }, [])

  function close(status: RoomGuideOutcome = 'dismissed') {
    if (stepRef.current === null) return
    stepRef.current = null
    setStep(null)
    if (userId) persist(userId, status)
  }

  useEffect(() => {
    setStep(null)
    return () => {
      if (userId && stepRef.current !== null) persist(userId, 'dismissed')
    }
  }, [code, userId, persist])

  useEffect(() => {
    if (!userId || !ready) return
    const pending = getPendingRoomGuideSave(userId)
    if (pending) persist(userId, pending)
    if (!hasRoomGuideCreation(userId, code) || pending) return
    let cancelled = false
    const controller = new AbortController()
    void getApiProfileMe(undefined, controller.signal)
      .then(({ profile }) => {
        if (cancelled || useAuthStore.getState().user?.id !== userId) return
        consumeRoomGuideCreation(userId, code)
        if (readRoomGuide(profile.appConfig)?.status === 'pending') start()
      })
      .catch(() => {})
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [code, ready, userId, start, persist])

  return { step, setStep, start, close, returnFocus }
}
