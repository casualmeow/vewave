import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Semantic API for the layered glass material defined in styles.css.
 *
 * Surfaces declare what they are (thickness, elevation, tone, interaction)
 * instead of tuning raw blur values. The CSS layers translate the declaration
 * into scattering, lensing, tint, highlight, and shadow, and every value
 * respects the appearance "glass intensity" setting plus the reduced
 * transparency / no-backdrop-filter fallbacks.
 *
 * Surface — whether the pane is material at all: `auto` (default) resolves
 *   from the global appearance `surfaceStyle`; `glass` forces the material;
 *   `solid` always renders opaque. Resolution happens in CSS via
 *   `data-surface-style`, so flipping the setting restyles every auto
 *   surface without re-rendering.
 * Role — the semantic recipe: which conventional token the pane falls back
 *   to when solid (shell → card, dialog/sheet/menu → popover, control →
 *   control fill, media → media chrome) plus role-specific material adjustments
 *   (the shell skips scattering — it sits over the static environment only).
 * Material — the rendering backend: `glass` is the stable production frost;
 *   `liquidGlass` opts into the pointer-aware rim highlight and press
 *   response, and pairs with the displacement filter from
 *   useLiquidGlassRefraction where the experimental flag allows it.
 * Thickness — physical size of the pane ("larger surface = thicker glass"):
 *   thin    → compact controls and menus
 *   regular → bars, docks, medium panels
 *   thick   → large panels: dialogs, sheets, the app shell
 * Elevation — how far the pane floats above content (shadow depth).
 * BackdropTone — explicit context for what sits behind the pane: auto follows
 *   the theme, light/dark declare a known backdrop, media is chrome over
 *   video. Callers declare context; no automatic luminance analysis exists.
 * Interaction — static chrome vs. pressable controls.
 */
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
      dialog: 'glass-role-dialog',
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
  }

export function GlassSurface({
  asChild = false,
  backdropTone,
  className,
  elevation,
  interaction,
  material,
  role,
  surface,
  thickness,
  ...props
}: GlassSurfaceProps) {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      data-slot="glass-surface"
      className={cn(
        glassSurfaceVariants({
          surface,
          role,
          material,
          thickness,
          elevation,
          backdropTone,
          interaction,
        }),
        className,
      )}
      {...props}
    />
  )
}
