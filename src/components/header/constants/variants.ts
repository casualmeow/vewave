import { cva } from 'class-variance-authority'

export const headerVariants = cva(
  [
    'left-1/2 z-50 isolate flex -translate-x-1/2 items-center overflow-visible border',
    'supports-[backdrop-filter]:backdrop-blur-[var(--header-blur)] supports-[backdrop-filter]:backdrop-saturate-200',
    'outline-none [transform-style:preserve-3d]',
  ],
  {
    variants: {
      position: {
        fixed: 'fixed',
        sticky: 'sticky',
        absolute: 'absolute',
      },
      size: {
        sm: 'h-12 px-3',
        md: 'h-14 px-4',
        lg: 'h-16 px-5',
      },
      variant: {
        glass: [
          'border-[color:var(--glass-border)] bg-[var(--glass-background)] text-header-foreground',
          'shadow-[0_18px_54px_color-mix(in_srgb,var(--foreground)_16%,transparent),inset_0_1px_0_var(--glass-highlight)]',
        ],
        glassDark: [
          'border-[color:var(--glass-border)] bg-[color-mix(in_srgb,var(--background)_72%,transparent)] text-header-foreground',
          'shadow-[0_16px_48px_color-mix(in_srgb,var(--foreground)_24%,transparent),inset_0_1px_0_var(--glass-highlight)]',
        ],
        glassLight: [
          'border-header-border bg-header text-header-foreground',
          'shadow-[0_16px_48px_color-mix(in_srgb,var(--foreground)_10%,transparent),inset_0_1px_0_var(--glass-highlight)]',
        ],
        liquidGlass: [
          'border-[color:var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--glass-highlight)_76%,transparent),var(--glass-background)_44%,color-mix(in_srgb,var(--accent)_24%,transparent)_100%)] text-header-foreground',
          'shadow-[0_26px_84px_color-mix(in_srgb,var(--foreground)_20%,transparent),0_10px_28px_color-mix(in_srgb,var(--accent)_14%,transparent),inset_0_1px_0_var(--glass-highlight)]',
          'supports-[backdrop-filter]:bg-[var(--glass-background)]',
        ],
        telegramGlass: [
          'border-[color:var(--glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--glass-highlight)_58%,transparent),var(--glass-background))] text-header-foreground',
          'shadow-[0_18px_64px_color-mix(in_srgb,var(--foreground)_16%,transparent),inset_0_1px_0_var(--glass-highlight)]',
          'supports-[backdrop-filter]:bg-[var(--glass-background)]',
        ],
        solid: [
          'border-border bg-background text-foreground',
          'shadow-[0_16px_48px_color-mix(in_srgb,var(--foreground)_18%,transparent)]',
        ],
        gradient: [
          'border-header-border bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--background)_100%)] text-header-foreground',
          'shadow-[0_16px_48px_color-mix(in_srgb,var(--foreground)_24%,transparent)]',
        ],
        glow: [
          'border-header-border bg-header text-header-foreground',
          'shadow-[0_16px_48px_color-mix(in_srgb,var(--foreground)_28%,transparent),0_0_56px_color-mix(in_srgb,var(--header-glow)_40%,transparent)]',
        ],
      },
    },
    defaultVariants: {
      position: 'fixed',
      size: 'md',
      variant: 'glass',
    },
  },
)

export const headerNavItemVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full',
    'text-sm font-medium outline-none transition-[background-color,color,opacity,box-shadow,filter]',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-[18px]',
      },
      active: {
        true: [
          'bg-[var(--tabs-active)] text-foreground opacity-100 shadow-[0_10px_28px_color-mix(in_srgb,var(--foreground)_12%,transparent),inset_0_1px_0_var(--glass-highlight)]',
          'backdrop-blur-xl',
        ],
        false:
          'text-current opacity-76 hover:bg-accent/45 hover:opacity-100 hover:[filter:saturate(1.14)]',
      },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-45',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      active: false,
      disabled: false,
    },
  },
)

export const headerButtonVariants = cva(
  [
    'inline-flex select-none items-center justify-center gap-2 rounded-full font-medium',
    'outline-none transition-[background-color,border-color,color,box-shadow,transform,opacity,filter]',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-55',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_18%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl hover:bg-primary/90',
        outline:
          'border border-current/45 bg-transparent text-current hover:bg-accent/45 hover:[filter:saturate(1.12)]',
        ghost: 'bg-transparent text-current opacity-80 hover:bg-accent/45 hover:opacity-100',
        soft: 'bg-accent/45 text-accent-foreground shadow-[inset_0_1px_0_var(--glass-highlight)] hover:bg-accent/60',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
        icon: 'size-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  },
)
