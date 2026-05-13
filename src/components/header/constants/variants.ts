import { cva } from 'class-variance-authority'

export const headerVariants = cva(
  [
    'left-1/2 z-50 isolate flex -translate-x-1/2 items-center overflow-visible border',
    'supports-[backdrop-filter]:backdrop-blur-[var(--header-blur)]',
    'outline-none',
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
          'border-white/[0.20] bg-white/[0.10] text-white',
          'shadow-[0_16px_48px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]',
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
    'text-sm font-medium outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-white/[0.35] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-[18px]',
      },
      active: {
        true: 'bg-white/[0.16] text-white',
        false: 'text-current opacity-80 hover:bg-white/[0.10] hover:opacity-100',
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
    'outline-none transition-[background-color,border-color,color,box-shadow,transform,opacity]',
    'focus-visible:ring-2 focus-visible:ring-white/[0.35] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-55',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-white text-zinc-950 hover:bg-white/[0.90]',
        outline: 'border border-current bg-transparent text-current hover:bg-white/[0.10]',
        ghost: 'bg-transparent text-current opacity-80 hover:bg-white/[0.10] hover:opacity-100',
        soft: 'bg-white/[0.12] text-current hover:bg-white/[0.18]',
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
