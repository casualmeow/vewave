import { useCallback, useEffect, useRef } from 'react'

import { SpikeApproximationLens, SpikeDomBackdrop } from '../spike-surfaces'
import {
  emptyFrameSample,
  instrumentationSnapshot,
  sampleFrames,
  waitFrames,
} from '../spike-runtime'
import { OutcomeLabel, useComputedBackdropFilter, useLatestRef } from './shared'
import type { SpikeScenarioProps } from '../types'
import { useLiquidGlassRefraction } from '@/shared/hooks'
import { supportsLiquidGlassRefraction } from '@/shared/lib/liquid-glass'
import { GlassSurface } from '@/shared/ui/glass-surface'

const lensSize = { width: 240, height: 96 }

export function ArbitraryDomScenario({
  variant,
  mode,
  onReady,
  publish,
  setStatus,
  note,
  complete,
}: SpikeScenarioProps) {
  const glassRef = useRef<HTMLDivElement>(null)
  const resolveGlassElement = useCallback(
    () => document.querySelector<HTMLElement>('[data-lens-spike-glass]'),
    [],
  )
  const [computedBackdrop, readBackdrop] = useComputedBackdropFilter(resolveGlassElement)
  const nativeSupported = supportsLiquidGlassRefraction()
  const refraction = useLiquidGlassRefraction({
    enabled: variant === 'native-svg',
    radius: 18,
    edgeWidth: 16,
    refraction: 22,
    scattering: 9,
  })
  const publishRef = useLatestRef(publish)
  const readyRef = useLatestRef(onReady)
  const completeRef = useLatestRef(complete)
  const statusRef = useLatestRef(setStatus)
  const noteRef = useLatestRef(note)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await waitFrames(4)
      if (cancelled) return
      readBackdrop()
      readyRef.current()
      const frames = mode === 'measure' ? await sampleFrames(90) : emptyFrameSample
      if (cancelled) return

      if (variant === 'native-svg') {
        if (!nativeSupported) {
          statusRef.current('unavailable')
          noteRef.current(
            'Native SVG backdrop displacement is not offered by this engine: supportsLiquidGlassRefraction() is false. No production seam exists to force it on.',
          )
        } else if (!refraction.active) {
          statusRef.current('degraded')
          noteRef.current(
            'supportsLiquidGlassRefraction() is true but the hook did not activate; the displacement map may not have generated.',
          )
        }
      }

      publishRef.current({
        ...frames,
        nativeRefractionSupported: nativeSupported,
        nativeRefractionActive: variant === 'native-svg' ? refraction.active : false,
        computedBackdropFilter: computedBackdrop,
        lensMechanism:
          variant === 'native-svg'
            ? 'backdrop-filter: url() + feImage/feDisplacementMap'
            : variant === 'backdrop-blur'
              ? 'backdrop-filter: blur/saturate'
              : variant === 'css-approximation'
                ? 'spike CSS approximation'
                : 'opaque fill',
        webglEligibleForArbitraryDom: false,
        ...instrumentationSnapshot(),
      })
      completeRef.current()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [variant, mode, refraction.active, nativeSupported, computedBackdrop])

  const lensStyle = { width: lensSize.width, height: lensSize.height, borderRadius: 18 }

  return (
    <div className="grid gap-3">
      <OutcomeLabel
        label={`variant: ${variant}`}
        detail={
          variant === 'native-svg'
            ? nativeSupported
              ? refraction.active
                ? 'native displacement active'
                : 'supported but inactive'
              : 'not available in this engine'
            : undefined
        }
      />
      <SpikeDomBackdrop>
        {variant === 'solid' ? (
          <div
            aria-hidden
            style={lensStyle}
            className="border border-border bg-popover shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          />
        ) : variant === 'css-approximation' ? (
          <SpikeApproximationLens
            size={lensSize}
            radius={18}
            strength="medium"
            frozen={mode === 'capture'}
          />
        ) : (
          <>
            {variant === 'native-svg' ? refraction.filterNode : null}
            <GlassSurface
              ref={variant === 'native-svg' ? refraction.ref : glassRef}
              aria-hidden
              data-lens-spike-glass
              surface="glass"
              role="control"
              thickness="regular"
              elevation="raised"
              style={{ ...lensStyle, ...(variant === 'native-svg' ? refraction.style : undefined) }}
              className={
                variant === 'native-svg' && refraction.active ? 'glass-material-liquid' : ''
              }
              {...(variant === 'native-svg' && refraction.active ? refraction.handlers : {})}
            />
          </>
        )}
      </SpikeDomBackdrop>
    </div>
  )
}
