import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { useCallback, useMemo, type ComponentProps, type CSSProperties } from 'react'

import type { GlassMotion } from '@/shared/theme/contract'
import { cn } from '@/shared/lib/utils'
import { useGlassAppearance } from '@/shared/hooks/use-glass-appearance'
import { useLiquidGlassRefraction } from '@/shared/hooks/use-liquid-glass-refraction'
import { readGlassThemeTokens, resolveGlassMaterial } from '@/shared/lib/glass-material'
import { useGlassScenePane } from '@/shared/lib/glass-scene-context'
import { useGlassInteractionScope } from '@/shared/lib/glass-interaction-scope'

export const glassSurfaceVariants = cva('glass-surface', {
  variants: {
    surface: {
      auto: 'glass-surface-auto',
      glass: '',
      solid: 'glass-surface-opaque',
    },
    role: {
      none: '',
      shell: 'glass-role-shell',
      header: 'glass-role-header',
      navigation: 'glass-role-navigation',
      dialog: 'glass-role-dialog',
      form: 'glass-role-form',
      sheet: 'glass-role-sheet',
      menu: 'glass-role-menu',
      control: 'glass-role-control',
      media: 'glass-surface-media',
    },
    material: {
      glass: '',
      liquidGlass: 'glass-material-liquid',
    },
    thickness: {
      thin: 'glass-surface-thin',
      regular: '',
      thick: 'glass-surface-thick',
    },
    elevation: {
      embedded: 'glass-surface-embedded',
      raised: '',
      floating: 'glass-surface-floating',
    },
    backdropTone: {
      auto: '',
      light: 'glass-surface-tone-light',
      dark: 'glass-surface-tone-dark',
      media: 'glass-surface-media',
    },
    interaction: {
      static: '',
      control: 'glass-surface-control',
    },
  },
  defaultVariants: {
    surface: 'auto',
    role: 'none',
    material: 'glass',
    thickness: 'regular',
    elevation: 'raised',
    backdropTone: 'auto',
    interaction: 'static',
  },
})

export type GlassSurfaceVariants = VariantProps<typeof glassSurfaceVariants>

type GlassSurfaceProps = ComponentProps<'div'> &
  GlassSurfaceVariants & {
    asChild?: boolean

    backdropSource?: 'dom' | 'scene'
    motion?: 'auto' | GlassMotion
    presence?: 'none' | 'dialog' | 'popover' | 'sheet'
  }

export function GlassSurface({
  asChild = false,
  backdropSource = 'dom',
  motion = 'auto',
  presence = 'none',
  backdropTone,
  className,
  elevation,
  interaction,
  material,
  role,
  surface,
  thickness,
  ref,
  style,
  onPointerMove,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...props
}: GlassSurfaceProps) {
  const Comp = asChild ? Slot : 'div'
  const appearance = useGlassAppearance()
  const scope = useGlassInteractionScope()
  const isGlass =
    surface === 'glass' || (surface !== 'solid' && appearance.surfaceStyle === 'glass')
  const optics = useMemo(
    () =>
      resolveGlassMaterial({
        mode:
          backdropTone === 'light' || backdropTone === 'dark'
            ? backdropTone
            : appearance.resolvedMode,
        intensity: appearance.glassIntensity,
        tokens: readGlassThemeTokens(),
        role: backdropTone === 'media' ? 'media' : (role ?? 'none'),
        thickness: thickness ?? 'regular',
        elevation: elevation ?? 'raised',
      }),
    [appearance, backdropTone, role, thickness, elevation],
  )
  const scene = useGlassScenePane({
    enabled:
      backdropSource === 'scene' &&
      isGlass &&
      !appearance.reducedTransparency &&
      !appearance.forceFallback,
    material: optics,
  })
  const smoked =
    role === 'dialog' || role === 'form' || Boolean(scope && (role === 'sheet' || role === 'menu'))
  const refraction = useLiquidGlassRefraction({
    enabled: isGlass && !scene.ready && role !== 'shell',
    profile: smoked ? 'modal' : 'edge',
    motion,
    motionEnabled: isGlass && !scene.ready,
    interactive: interaction === 'control',
    refraction: optics.displacement * 2,
    edgeWidth: thickness === 'thin' ? 10 : thickness === 'thick' ? 22 : 16,
  })
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      refraction.ref(node)
      scene.ref(node)
      const cleanup = typeof ref === 'function' ? ref(node) : undefined
      if (ref && typeof ref !== 'function') ref.current = node
      return () => {
        refraction.ref(null)
        scene.ref(null)
        if (typeof cleanup === 'function') cleanup()
        else if (typeof ref === 'function') ref(null)
        else if (ref) ref.current = null
      }
    },
    [ref, refraction.ref, scene.ref],
  )

  return (
    <>
      {refraction.filterNode}
      <Comp
        ref={setRef}
        data-slot="glass-surface"
        data-glass-pressed={refraction.pressed || undefined}
        data-glass-optics={
          scene.ready ? 'scene' : refraction.active ? 'native' : isGlass ? 'css' : 'solid'
        }
        data-glass-modal={isGlass && smoked ? '' : undefined}
        data-glass-motion={scope || (isGlass && smoked) ? refraction.motion : undefined}
        data-glass-interaction={scope ? 'scoped' : undefined}
        data-glass-presence={scope && presence !== 'none' ? presence : undefined}
        className={cn(
          glassSurfaceVariants({
            surface,
            role,
            material: material ?? (isGlass ? 'liquidGlass' : 'glass'),
            thickness,
            elevation,
            backdropTone,
            interaction,
          }),
          className,
        )}
        style={
          {
            '--glass-resolved-tint': optics.tintColor,
            '--glass-resolved-opacity': `${optics.tintOpacity * 100}%`,
            '--glass-reading-opacity': `${optics.readabilityOpacity * 100}%`,
            '--glass-reflection-color': optics.reflectionColor,
            '--glass-pointer-reflection-opacity': `${optics.bodyReflection * 500}%`,
            '--glass-blur-base': `${optics.centerBlur}px`,
            ...refraction.style,
            ...style,
          } as CSSProperties
        }
        onPointerMove={(event) => {
          onPointerMove?.(event)
          refraction.handlers.onPointerMove(event)
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          refraction.handlers.onPointerDown()
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event)
          refraction.handlers.onPointerUp()
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event)
          refraction.handlers.onPointerLeave()
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event)
          refraction.handlers.onPointerCancel()
        }}
        {...props}
      />
    </>
  )
}
