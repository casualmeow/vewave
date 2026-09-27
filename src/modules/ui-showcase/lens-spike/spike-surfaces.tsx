import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { sampleRoundedRectEdgeDisplacement } from '@/shared/lib/liquid-glass'
import { cn } from '@/shared/lib/utils'

export function resolveEdgeProfile({
  width,
  height,
  radius,
  edgeWidth,
}: {
  width: number
  height: number
  radius: number
  edgeWidth: number
}) {
  const samples = 24
  let weightSum = 0
  let firstNeutralOffset = edgeWidth

  for (let index = 0; index < samples; index += 1) {
    const offset = (index / (samples - 1)) * edgeWidth
    const sample = sampleRoundedRectEdgeDisplacement({
      width,
      height,
      radius,
      edgeWidth,
      x: Math.min(width - 0.5, offset + 0.5),
      y: height / 2,
    })
    weightSum += sample.weight
    if (sample.weight <= 0.001 && firstNeutralOffset === edgeWidth) firstNeutralOffset = offset
  }

  return {
    meanWeight: weightSum / samples,
    neutralOffsetPx: firstNeutralOffset,
  }
}

export type ApproximationStrength = 'low' | 'medium' | 'high'

const strengthTuning: Record<
  ApproximationStrength,
  { blur: number; saturate: number; rim: number }
> = {
  low: { blur: 8, saturate: 1.2, rim: 0.4 },
  medium: { blur: 14, saturate: 1.45, rim: 0.62 },
  high: { blur: 20, saturate: 1.7, rim: 0.82 },
}

export function SpikeApproximationLens({
  chromatic = false,
  className,
  frozen = false,
  radius = 18,
  size = { width: 220, height: 92 },
  strength = 'medium',
}: {
  chromatic?: boolean
  className?: string

  frozen?: boolean
  radius?: number
  size?: { width: number; height: number }
  strength?: ApproximationStrength
}) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [pointer, setPointer] = useState({ x: 50, y: 24 })
  const tuning = strengthTuning[strength]
  const edgeWidth = Math.max(6, Math.min(size.width, size.height) * 0.16)
  const profile = useMemo(
    () => resolveEdgeProfile({ width: size.width, height: size.height, radius, edgeWidth }),
    [edgeWidth, radius, size.height, size.width],
  )

  useEffect(() => {
    if (frozen) return
    const element = elementRef.current
    if (!element) return
    const handlePointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      setPointer({
        x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
        y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
      })
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [frozen])

  const rimAlpha = tuning.rim * (0.5 + profile.meanWeight)
  const style: CSSProperties = {
    width: size.width,
    height: size.height,
    borderRadius: radius,
    backdropFilter: `blur(${tuning.blur}px) saturate(${tuning.saturate})`,
    WebkitBackdropFilter: `blur(${tuning.blur}px) saturate(${tuning.saturate})`,
    boxShadow: [
      `inset ${profile.neutralOffsetPx * 0.08}px ${profile.neutralOffsetPx * 0.08}px 0 rgba(255,255,255,${rimAlpha.toFixed(3)})`,
      `inset -1px -1px 0 rgba(255,255,255,${(rimAlpha * 0.22).toFixed(3)})`,
      `inset 0 0 ${edgeWidth.toFixed(1)}px rgba(0,0,0,${(0.18 * tuning.rim).toFixed(3)})`,
      `0 12px 32px rgba(0,0,0,0.18)`,
    ].join(', '),
  }

  return (
    <div
      ref={elementRef}
      data-lens-spike-approximation
      aria-hidden
      className={cn('pointer-events-none relative overflow-hidden', className)}
      style={style}
    >
      <span
        className="absolute inset-0"
        style={{
          borderRadius: 'inherit',
          background: `radial-gradient(${(edgeWidth * 7).toFixed(0)}px circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,${(0.34 * tuning.rim).toFixed(3)}), transparent 70%)`,
        }}
      />

      {chromatic ? (
        <span
          className="absolute inset-0 mix-blend-screen"
          style={{
            borderRadius: 'inherit',
            boxShadow: `inset 1.5px 0 0 rgba(255,64,64,0.30), inset -1.5px 0 0 rgba(64,128,255,0.30), inset 0 1.5px 0 rgba(255,96,32,0.18), inset 0 -1.5px 0 rgba(64,196,255,0.18)`,
          }}
        />
      ) : null}
    </div>
  )
}

export function SpikeDomBackdrop({ children }: { children?: ReactNode }) {
  return (
    <div
      data-lens-spike-backdrop
      className="relative isolate h-[320px] w-full overflow-hidden rounded-xl border border-border/70"
    >
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="bg-[#f4f6f7] p-4">
          <p className="text-[13px] font-semibold leading-5 text-[#0d1418]">
            Readable text on a light field. Refraction should bend these baselines near the lens
            boundary while the centre of the pane stays legible and stable.
          </p>
          <div
            className="mt-3 h-24 w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg,#0d1418 0 10px,#f4f6f7 10px 20px), repeating-linear-gradient(0deg,rgba(60,110,190,0.5) 0 1px,transparent 1px 24px)',
            }}
          />
        </div>
        <div className="bg-[#080d12] p-4">
          <p className="text-[13px] font-semibold leading-5 text-[#e8f2f5]">
            The same text inverted. The vertical seam down the middle is a hard luminance boundary —
            the most sensitive place to look for edge displacement.
          </p>
          <img
            src="/spike/field.png"
            alt=""
            aria-hidden
            className="mt-3 h-24 w-full object-cover"
            draggable={false}
          />
        </div>
      </div>
      <div className="relative z-10 grid h-full place-items-center">{children}</div>
    </div>
  )
}
