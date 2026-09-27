import type { AppearanceSettings } from '@/shared/theme'

export type AppearanceSaveStatus = 'saved' | 'pending' | 'saving' | 'error'

export function createAppearanceSaveQueue(
  save: (settings: AppearanceSettings) => Promise<void>,
  publish: (status: AppearanceSaveStatus) => void,
) {
  let pending: AppearanceSettings | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let running = false
  let cancelled = false

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }
  const flush = async () => {
    clearTimer()
    if (cancelled || running || !pending) return
    running = true
    while (pending && !cancelled) {
      const snapshot = pending
      pending = null
      publish('saving')
      try {
        await save(snapshot)
      } catch {
        if (cancelled) return
        pending ??= snapshot
        running = false
        publish('error')
        return
      }
    }
    running = false
    clearTimer()
    if (!cancelled) publish('saved')
  }
  return {
    enqueue(settings: AppearanceSettings) {
      if (cancelled) return
      pending = settings
      clearTimer()
      publish('pending')
      timer = setTimeout(() => void flush(), 600)
    },
    flush,
    cancel() {
      cancelled = true
      clearTimer()
      pending = null
    },
  }
}
