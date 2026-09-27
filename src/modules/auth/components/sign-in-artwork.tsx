import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PropsWithChildren, RefObject } from 'react'
import type { AuthSceneInstance, AuthSceneOptions } from '../rendering/auth-scene-renderer'
import { useGlassAppearance } from '@/shared/hooks/use-glass-appearance'
import { resolveGlassMaterial } from '@/shared/lib/glass-material'
import { useGlassInteractionScope } from '@/shared/lib/glass-interaction-scope'
import {
  createVewaveLogoSvgDataUrl,
  getLogoColorsForTone,
  resolveGlassMotion,
  useAppearance,
} from '@/shared/theme'

export function SignInBrand() {
  const { tokens, resolvedMode } = useAppearance()
  const colors = getLogoColorsForTone(resolvedMode === 'dark' ? 'light' : 'dark', tokens)
  return (
    <img
      className="sign-in-logo"
      src={createVewaveLogoSvgDataUrl(colors)}
      width="340"
      height="156"
      alt="Vewave"
      draggable={false}
    />
  )
}

type SignInArtworkProps = PropsWithChildren<{
  plateRef: RefObject<HTMLElement | null>
  formRef: RefObject<HTMLElement | null>
}>

export function SignInArtwork({ children, plateRef, formRef }: SignInArtworkProps) {
  const { settings, tokens, resolvedMode } = useAppearance()
  const appearance = useGlassAppearance()
  const interactionScope = useGlassInteractionScope()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<AuthSceneInstance | null>(null)
  const [ready, setReady] = useState(false)
  const patternId = useId()
  const material = resolveGlassMaterial({
    mode: resolvedMode,
    intensity: settings.glassIntensity,
    tokens,
    role: 'form',
    thickness: 'thick',
  })
  const motion = resolveGlassMotion({
    ...appearance,
    requested: settings.glassMotion === 'off' ? 'off' : 'auto',
    preference: settings.glassMotion,
    surfaceStyle: settings.surfaceStyle,
  })
  const options = useMemo<AuthSceneOptions>(
    () => ({
      palette: {
        background: tokens.background,
        card: tokens.card,
        popover: tokens.popover,
        foreground: tokens.foreground,
        mutedForeground: tokens.mutedForeground,
        accent: tokens.logoAccent,
      },
      surfaceStyle: settings.surfaceStyle,
      mode: resolvedMode,
      intensity: settings.glassIntensity,
      motion,
    }),
    [
      tokens.background,
      tokens.card,
      tokens.popover,
      tokens.foreground,
      tokens.mutedForeground,
      tokens.logoAccent,
      settings.surfaceStyle,
      settings.glassIntensity,
      resolvedMode,
      motion,
    ],
  )
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
    instanceRef.current?.setOptions(options)
  }, [options])

  useEffect(() => {
    const plate = plateRef.current
    if (!plate || !interactionScope) return
    return interactionScope.register(plate, (event) => {
      const bounds = canvasRef.current?.getBoundingClientRect()
      if (!bounds) return
      instanceRef.current?.setInteraction({
        ...event,
        x: event.x - bounds.left,
        y: event.y - bounds.top,
      })
    })
  }, [interactionScope, plateRef])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    let cancelled = false
    let generation = 0
    let failed = false

    function measure() {
      const canvas = canvasRef.current
      const plate = plateRef.current
      const form = formRef.current
      if (!canvas || !plate || !form || !instanceRef.current) return
      const bounds = canvas.getBoundingClientRect()
      const pane = plate.getBoundingClientRect()
      const fields = form.getBoundingClientRect()
      instanceRef.current.setGeometry({
        width: bounds.width,
        height: bounds.height,
        plate: {
          x: pane.left - bounds.left,
          y: pane.top - bounds.top,
          width: pane.width,
          height: pane.height,
          radius: parseFloat(getComputedStyle(plate).borderTopLeftRadius) || 32,
        },
        formStartX: fields.left - bounds.left,
      })
    }

    function release() {
      instanceRef.current?.destroy()
      instanceRef.current = null
      setReady(false)
    }

    async function update() {
      const ticket = ++generation
      if (!desktop.matches || appearance.reducedTransparency || appearance.forceFallback) {
        release()
        return
      }
      if (instanceRef.current || failed) return
      try {
        const { createAuthSceneRenderer } = await import('../rendering/auth-scene-renderer')
        if (cancelled || ticket !== generation || !canvasRef.current) return
        const instance = createAuthSceneRenderer(canvasRef.current, {
          ...optionsRef.current,
          onReady: () => {
            if (!cancelled && !failed && ticket === generation) setReady(true)
          },
          onError: () => {
            if (cancelled || ticket !== generation) return
            failed = true
            release()
          },
        })
        if (failed) instance?.destroy()
        else instanceRef.current = instance
        if (!instance) failed = true
        measure()
      } catch {
        if (cancelled || ticket !== generation) return
        failed = true
        release()
      }
    }

    const observer = new ResizeObserver(measure)
    for (const element of [canvasRef.current, plateRef.current, formRef.current]) {
      if (element) observer.observe(element)
    }
    const onBreakpointChange = () => {
      void update()
    }
    desktop.addEventListener('change', onBreakpointChange)
    window.addEventListener('resize', measure)
    void update()
    return () => {
      cancelled = true
      generation += 1
      observer.disconnect()
      desktop.removeEventListener('change', onBreakpointChange)
      window.removeEventListener('resize', measure)
      release()
    }
  }, [appearance.reducedTransparency, appearance.forceFallback, plateRef, formRef])

  return (
    <div
      className="sign-in-page"
      data-scene-ready={ready ? '' : undefined}
      data-material={settings.surfaceStyle}
      style={
        {
          '--auth-readability-opacity': `${material.readabilityOpacity * 100}%`,
          '--auth-muted-foreground': material.mutedForeground,
        } as CSSProperties
      }
      onPointerMove={(event) => {
        if (interactionScope || event.pointerType !== 'mouse' || motion === 'off') return
        const bounds = canvasRef.current?.getBoundingClientRect()
        if (!bounds) return
        instanceRef.current?.setPointer(
          event.clientX - bounds.left,
          event.clientY - bounds.top,
          true,
        )
      }}
      onPointerLeave={() => {
        if (!interactionScope) instanceRef.current?.setPointer(0, 0, false)
      }}
      onPointerCancel={() => {
        if (!interactionScope) instanceRef.current?.setPointer(0, 0, false)
      }}
    >
      <svg className="sign-in-scene-fallback" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={patternId} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill="currentColor" />
            <rect x="2" y="2" width="1" height="1" fill="currentColor" />
          </pattern>
        </defs>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-200 700C240 820 200 20 740 120S1070 770 1850 260L1850 550C1090 990 920 330 640 420S220 1120-200 1000Z"
            fill={`url(#${patternId})`}
            opacity="0.65"
          />
          <path
            d="M-100 400C280 50 420 620 920 620S1290 190 1720 90L1720 230C1280 300 1420 940 890 880S280 300-100 610Z"
            fill={`url(#${patternId})`}
            opacity="0.3"
          />
        </svg>
      </svg>
      <canvas className="sign-in-scene-canvas" ref={canvasRef} aria-hidden="true" />
      {children}
    </div>
  )
}
