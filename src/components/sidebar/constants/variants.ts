import { cva } from 'class-variance-authority'

export const SIDEBAR_SOFT_TRANSITION = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.8,
} as const

export const SIDEBAR_FLUID_TRANSITION = {
  type: 'spring',
  stiffness: 520,
  damping: 32,
  mass: 0.62,
} as const

export const SIDEBAR_MAGNETIC_TRANSITION = {
  type: 'spring',
  stiffness: 620,
  damping: 28,
  mass: 0.5,
} as const

export const SIDEBAR_FLUID_PRESETS = {
  subtle: {
    hoverScale: 1.025,
    activeHoverScale: 1.015,
    dragScale: 1.045,
    hoverSize: 3,
    magneticStrength: 4,
    magneticVerticalStrength: 2.5,
    tiltStrength: 1.8,
    focusBlur: true,
    focusBlurAmount: 2,
    focusDimOpacity: 0.72,
    liquidIntensity: 0.72,
    dragMode: 'both',
  },
  balanced: {
    hoverScale: 1.045,
    activeHoverScale: 1.03,
    dragScale: 1.075,
    hoverSize: 6,
    magneticStrength: 8,
    magneticVerticalStrength: 5,
    tiltStrength: 2.8,
    focusBlur: true,
    focusBlurAmount: 3.2,
    focusDimOpacity: 0.58,
    liquidIntensity: 1,
    dragMode: 'both',
  },
  expressive: {
    hoverScale: 1.07,
    activeHoverScale: 1.045,
    dragScale: 1.12,
    hoverSize: 10,
    magneticStrength: 13,
    magneticVerticalStrength: 8,
    tiltStrength: 4.2,
    focusBlur: true,
    focusBlurAmount: 4.5,
    focusDimOpacity: 0.46,
    liquidIntensity: 1.25,
    dragMode: 'both',
  },
  extreme: {
    hoverScale: 1.095,
    activeHoverScale: 1.062,
    dragScale: 1.17,
    hoverSize: 15,
    magneticStrength: 18,
    magneticVerticalStrength: 11,
    tiltStrength: 5.6,
    focusBlur: true,
    focusBlurAmount: 6,
    focusDimOpacity: 0.35,
    liquidIntensity: 1.55,
    dragMode: 'both',
  },
} as const

export const SIDEBAR_INITIAL_STYLE = {
  '--sidebar-pointer-x': '50%',
  '--sidebar-pointer-y': '8%',
  '--sidebar-glass-spot-opacity': '0.2',
  '--sidebar-glass-sheen-x': '18%',
  '--sidebar-glass-sheen-y': '8%',
  '--sidebar-focus-blur': '4px',
  '--sidebar-focus-opacity': '0.5',
  '--sidebar-hover-size': '10px',
  '--sidebar-liquid-intensity': '1.25',
} as const

export const sidebarRootVariants = cva(
  [
    'relative isolate flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[2rem] border',
    'text-sidebar-foreground outline-none [transform-style:preserve-3d]',
    'transition-[width,background-color,border-color,box-shadow] duration-300',
  ],
  {
    variants: {
      design: {
        solid: 'border-sidebar-border bg-sidebar shadow-sm',
        glass:
          'border-[color:var(--glass-border)] bg-[var(--glass-background)] shadow-[0_24px_70px_color-mix(in_srgb,var(--foreground)_14%,transparent)] backdrop-blur-2xl',
        liquidGlass: [
          'border-[color:var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--glass-highlight)_72%,transparent),var(--glass-background)_46%,color-mix(in_srgb,var(--accent)_24%,transparent)_100%)]',
          'shadow-[0_34px_96px_color-mix(in_srgb,var(--foreground)_22%,transparent),0_12px_36px_color-mix(in_srgb,var(--accent)_14%,transparent),inset_0_1px_0_var(--glass-highlight)]',
          'backdrop-blur-2xl backdrop-saturate-200 supports-[backdrop-filter]:bg-[var(--glass-background)]',
        ],
        fluent:
          'border-sidebar-border bg-[linear-gradient(135deg,var(--sidebar),var(--surface-elevated))] shadow-[0_18px_55px_color-mix(in_srgb,var(--foreground)_11%,transparent)] backdrop-blur-xl',
      },
      size: {
        sm: 'w-56',
        md: 'w-64',
        lg: 'w-72',
      },
      collapsed: {
        true: 'w-[5.25rem]',
        false: '',
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
      size: 'md',
      collapsed: false,
    },
  },
)

export const sidebarBrandVariants = cva('relative z-10 flex items-center gap-3 border-b', {
  variants: {
    design: {
      solid: 'border-sidebar-border',
      glass: 'border-[color:var(--glass-border)]',
      liquidGlass: 'border-[color:var(--glass-border)] bg-[var(--glass-background)]',
      fluent: 'border-sidebar-border',
    },
    size: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
    collapsed: {
      true: 'justify-center px-3',
      false: '',
    },
  },
  defaultVariants: {
    design: 'liquidGlass',
    size: 'md',
    collapsed: false,
  },
})

export const sidebarSectionVariants = cva('relative z-10', {
  variants: {
    size: {
      sm: 'px-2 py-2',
      md: 'px-3 py-3',
      lg: 'px-4 py-4',
    },
    density: {
      compact: 'space-y-2',
      comfortable: 'space-y-3',
    },
  },
  defaultVariants: {
    size: 'md',
    density: 'comfortable',
  },
})

export const sidebarItemVariants = cva(
  [
    'relative z-10 flex w-full select-none items-center gap-3 rounded-[1.18rem] text-sm font-medium',
    'outline-none transition-[color,background-color,opacity,filter] duration-200',
    'focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ],
  {
    variants: {
      design: {
        solid:
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground',
        glass:
          'text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground',
        liquidGlass:
          'text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground group-hover/sidebar-item-shell:[filter:saturate(1.12)]',
        fluent:
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:text-sidebar-accent-foreground',
      },
      size: {
        sm: 'min-h-9 px-2.5 py-2 text-sm',
        md: 'min-h-10 px-3 py-2.5',
        lg: 'min-h-11 px-3.5 py-3 text-[0.95rem]',
      },
      collapsed: {
        true: 'justify-center px-2',
        false: 'justify-start',
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
      size: 'md',
      collapsed: false,
    },
  },
)

export const sidebarActiveIndicatorVariants = cva(
  'pointer-events-none absolute inset-0 overflow-hidden rounded-[1.18rem] border [transform:translateZ(0)]',
  {
    variants: {
      design: {
        solid: 'border-sidebar-border bg-sidebar-accent shadow-sm',
        glass:
          'border-[color:var(--glass-border)] bg-sidebar-accent shadow-[0_14px_34px_color-mix(in_srgb,var(--foreground)_11%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl',
        liquidGlass: [
          'border-[color:var(--glass-border)] bg-[radial-gradient(circle_at_var(--item-pointer-x,18%)_var(--item-pointer-y,0%),var(--glass-highlight),transparent_36%),linear-gradient(135deg,var(--sidebar-accent),var(--glass-background)_54%,color-mix(in_srgb,var(--accent)_28%,transparent))]',
          'shadow-[0_20px_50px_color-mix(in_srgb,var(--accent)_22%,transparent),0_8px_20px_color-mix(in_srgb,var(--foreground)_12%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-200',
        ],
        fluent:
          'border-sidebar-border bg-sidebar-accent shadow-[inset_3px_0_0_var(--sidebar-primary),0_8px_22px_color-mix(in_srgb,var(--sidebar-primary)_14%,transparent)]',
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
    },
  },
)

export const sidebarBadgeVariants = cva(
  'ml-auto rounded-full px-2 py-0.5 text-[0.68rem] font-semibold leading-none',
  {
    variants: {
      design: {
        solid: 'bg-sidebar-primary text-sidebar-primary-foreground',
        glass: 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm',
        liquidGlass:
          'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_color-mix(in_srgb,var(--sidebar-primary)_20%,transparent),inset_0_1px_0_var(--glass-highlight)]',
        fluent: 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm',
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
    },
  },
)

export const sidebarFooterVariants = cva('relative z-10 mt-auto border-t', {
  variants: {
    design: {
      solid: 'border-sidebar-border',
      glass: 'border-[color:var(--glass-border)]',
      liquidGlass: 'border-[color:var(--glass-border)] bg-[var(--glass-background)]',
      fluent: 'border-sidebar-border',
    },
    size: {
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4',
    },
  },
  defaultVariants: {
    design: 'liquidGlass',
    size: 'md',
  },
})
