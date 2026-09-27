import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppearanceSaveQueue } from '@/modules/appearance/appearance-save-queue'
import { defaultAppearanceSettings } from '@/shared/theme'

const initial = { ...defaultAppearanceSettings, preset: 'heatwave' as const }
const final = { ...defaultAppearanceSettings, preset: 'coldwave' as const }

describe('account appearance save queue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('coalesces rapid edits and flushes the final snapshot when Settings closes', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const status = vi.fn()
    const queue = createAppearanceSaveQueue(save, status)
    queue.enqueue(initial)
    await vi.advanceTimersByTimeAsync(300)
    queue.enqueue(final)
    await vi.advanceTimersByTimeAsync(300)
    expect(save).not.toHaveBeenCalled()
    await queue.flush()
    expect(save).toHaveBeenCalledExactlyOnceWith(final)
    expect(status).toHaveBeenLastCalledWith('saved')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('never overlaps requests and sends the latest edit after an in-flight save', async () => {
    let finish!: () => void
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve
          }),
      )
      .mockResolvedValue(undefined)
    const queue = createAppearanceSaveQueue(save, vi.fn())
    queue.enqueue(initial)
    await vi.advanceTimersByTimeAsync(600)
    queue.enqueue(defaultAppearanceSettings)
    queue.enqueue(final)
    await vi.advanceTimersByTimeAsync(600)
    expect(save).toHaveBeenCalledTimes(1)
    finish()
    await vi.advanceTimersByTimeAsync(0)
    expect(save.mock.calls.map(([settings]) => settings)).toEqual([initial, final])
  })

  it('retains a failed snapshot for retry and lets a newer edit replace it', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const status = vi.fn()
    const queue = createAppearanceSaveQueue(save, status)
    queue.enqueue(initial)
    await queue.flush()
    expect(status).toHaveBeenLastCalledWith('error')
    queue.enqueue(final)
    await vi.advanceTimersByTimeAsync(600)
    expect(save).toHaveBeenLastCalledWith(final)
    expect(status).toHaveBeenLastCalledWith('saved')
  })

  it('discards queued edits and ignores a late failure after an account switch', async () => {
    let fail!: (error: Error) => void
    const save = vi.fn().mockImplementation(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject
        }),
    )
    const status = vi.fn()
    const queue = createAppearanceSaveQueue(save, status)
    queue.enqueue(initial)
    const writing = queue.flush()
    queue.enqueue(final)
    queue.cancel()
    status.mockClear()
    fail(new Error('aborted'))
    await writing
    await queue.flush()
    await vi.advanceTimersByTimeAsync(1000)
    expect(save).toHaveBeenCalledTimes(1)
    expect(status).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
