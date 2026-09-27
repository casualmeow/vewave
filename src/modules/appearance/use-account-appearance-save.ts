import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAppearanceSaveQueue } from './appearance-save-queue'
import type { AppearanceSaveStatus } from './appearance-save-queue'
import { getGetApiProfileMeQueryKey, patchApiProfileMe } from '@/core/api/generated/profile/profile'
import { useAuthStore } from '@/modules/auth/model'
import {
  getAppearanceSettingsFromAppConfig,
  useAppearance,
  withAppearanceSettingsInAppConfig,
} from '@/shared/theme'

let appearanceWrite: Promise<void> = Promise.resolve()

export function useAccountAppearanceSave() {
  const { accountId, settings } = useAppearance()
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AppearanceSaveStatus>('saved')
  const queue = useRef<ReturnType<typeof createAppearanceSaveQueue> | null>(null)
  const latest = useRef(settings)
  latest.current = settings
  const previous = useRef(settings)

  useEffect(() => {
    previous.current = latest.current
    if (!accountId || accountId !== userId) {
      setStatus('saved')
      return
    }
    let mounted = true
    const owner = accountId
    const saves = createAppearanceSaveQueue(
      (snapshot) => {
        const write = appearanceWrite.then(async () => {
          const auth = useAuthStore.getState()
          if (auth.user?.id !== owner || !auth.accessToken) return
          const controller = new AbortController()
          const unsubscribe = useAuthStore.subscribe((next) => {
            if (next.user?.id !== owner) controller.abort()
          })
          try {
            await patchApiProfileMe(
              { appConfig: withAppearanceSettingsInAppConfig(auth.user.appConfig, snapshot) },
              undefined,
              controller.signal,
            )
            const current = useAuthStore.getState()
            if (controller.signal.aborted || current.user?.id !== owner || !current.accessToken)
              return
            current.setAuthenticated(
              {
                ...current.user,
                appConfig: withAppearanceSettingsInAppConfig(current.user.appConfig, snapshot),
              },
              current.accessToken,
            )
            await queryClient.invalidateQueries({ queryKey: getGetApiProfileMeQueryKey() })
          } finally {
            unsubscribe()
          }
        })
        appearanceWrite = write.catch(() => {})
        return write
      },
      (next) => {
        if (mounted) setStatus(next)
        else if (next === 'error' && useAuthStore.getState().user?.id === owner)
          toast.error('Could not save appearance to your account. Reopen Settings to retry.')
      },
    )
    queue.current = saves
    setStatus('saved')
    const remote = getAppearanceSettingsFromAppConfig(useAuthStore.getState().user?.appConfig)
    if (JSON.stringify(remote) !== JSON.stringify(latest.current)) saves.enqueue(latest.current)
    return () => {
      mounted = false
      queue.current = null

      if (useAuthStore.getState().user?.id === owner) void saves.flush()
      else saves.cancel()
    }
  }, [accountId, userId, queryClient])

  useEffect(() => {
    if (previous.current === settings) return
    previous.current = settings
    if (accountId === userId) queue.current?.enqueue(settings)
  }, [settings, accountId, userId])

  return { status, accountId, retry: () => queue.current?.enqueue(latest.current) }
}
