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
          'border-white/[0.24] bg-white/[0.14] text-white',
          'shadow-[0_18px_54px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(255,255,255,0.08)]',
        ],
        glassDark: [
          'border-white/[0.12] bg-black/[0.45] text-white',
          'shadow-[0_16px_48px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.10)]',
        ],
        glassLight: [
          'border-white/[0.60] bg-white/[0.75] text-zinc-950',
          'shadow-[0_16px_48px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.80)]',
          'dark:border-white/[0.10] dark:bg-zinc-950/[0.60] dark:text-zinc-50',
        ],
        liquidGlass: [
          'border-white/[0.52] bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(255,255,255,0.26)_44%,rgba(226,252,247,0.36)_100%)] text-zinc-950',
          'shadow-[0_26px_84px_rgba(15,23,42,0.20),0_10px_28px_rgba(20,184,166,0.10),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(255,255,255,0.26)]',
          'supports-[backdrop-filter]:bg-white/[0.26] dark:border-white/[0.14] dark:bg-white/[0.08] dark:text-zinc-50',
        ],
        telegramGlass: [
          'border-white/[0.36] bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18))] text-zinc-950',
          'shadow-[0_18px_64px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.74),inset_0_-1px_0_rgba(255,255,255,0.18)]',
          'supports-[backdrop-filter]:bg-white/[0.20] dark:border-white/[0.12] dark:bg-black/[0.32] dark:text-white',
        ],
        solid: [
          'border-border/[0.80] bg-background/[0.95] text-foreground',
          'shadow-[0_16px_48px_rgba(0,0,0,0.18)]',
        ],
        gradient: [
          'border-white/[0.15] bg-[linear-gradient(135deg,rgba(30,30,40,0.92)_0%,rgba(16,16,24,0.96)_100%)] text-white',
          'shadow-[0_16px_48px_rgba(0,0,0,0.28)]',
        ],
        glow: [
          'border-white/[0.15] bg-black/[0.50] text-white',
          'shadow-[0_16px_48px_rgba(0,0,0,0.32),0_0_56px_color-mix(in_srgb,var(--header-glow)_40%,transparent)]',
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
    'focus-visible:ring-2 focus-visible:ring-white/[0.42] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
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
          'bg-white/[0.64] text-zinc-950 opacity-100 shadow-[0_10px_28px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.88)]',
          'backdrop-blur-xl dark:bg-white/[0.16] dark:text-white',
        ],
        false:
          'text-current opacity-76 hover:bg-white/[0.22] hover:opacity-100 hover:[filter:saturate(1.14)] dark:hover:bg-white/[0.10]',
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
    'focus-visible:ring-2 focus-visible:ring-white/[0.42] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-55',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-white/[0.78] text-zinc-950 shadow-[0_10px_28px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl hover:bg-white/[0.90]',
        outline:
          'border border-current/45 bg-transparent text-current hover:bg-white/[0.14] hover:[filter:saturate(1.12)]',
        ghost: 'bg-transparent text-current opacity-80 hover:bg-white/[0.14] hover:opacity-100',
        soft: 'bg-white/[0.18] text-current shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] hover:bg-white/[0.26]',
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
