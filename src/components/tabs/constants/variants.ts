import { cva } from 'class-variance-authority'

export const tabsListVariants = cva(
  [
    'relative isolate inline-flex overflow-hidden border p-1 text-current',
    'supports-[backdrop-filter]:backdrop-blur-[var(--tabs-blur)] supports-[backdrop-filter]:backdrop-saturate-200',
    'outline-none [--tabs-blur:20px] [transform-style:preserve-3d]',
  ],
  {
    variants: {
      design: {
        solid: 'border-border bg-muted text-muted-foreground shadow-sm',
        glass: [
          'border-white/[0.34] bg-white/[0.18] text-zinc-950 shadow-[0_18px_48px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.46)]',
          'dark:border-white/[0.12] dark:bg-white/[0.08] dark:text-zinc-50',
        ],
        liquidGlass: [
          'border-white/[0.54] bg-[linear-gradient(135deg,rgba(255,255,255,0.64),rgba(255,255,255,0.22)_46%,rgba(226,252,247,0.34))] text-zinc-950',
          'shadow-[0_24px_76px_rgba(15,23,42,0.20),0_10px_30px_rgba(20,184,166,0.12),inset_0_1px_0_rgba(255,255,255,0.90),inset_0_-1px_0_rgba(255,255,255,0.28)]',
          'dark:border-white/[0.14] dark:bg-white/[0.08] dark:text-zinc-50',
        ],
        telegramGlass: [
          'border-white/[0.34] bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.16))] text-zinc-950',
          'shadow-[0_18px_56px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.76),inset_0_-1px_0_rgba(255,255,255,0.18)]',
          'dark:border-white/[0.12] dark:bg-black/[0.30] dark:text-white',
        ],
      },
      size: {
        sm: 'gap-1 rounded-[1.35rem]',
        md: 'gap-1.5 rounded-[1.65rem]',
        lg: 'gap-2 rounded-[1.9rem]',
      },
      orientation: {
        horizontal: 'flex-row items-center',
        vertical: 'flex-col items-stretch',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-fit',
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
      size: 'md',
      orientation: 'horizontal',
      fullWidth: false,
    },
  },
)

export const tabsTriggerVariants = cva(
  [
    'relative z-10 inline-flex min-w-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium',
    'outline-none transition-[color,opacity,filter] duration-200',
    'focus-visible:ring-2 focus-visible:ring-white/[0.48] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-45 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45',
  ],
  {
    variants: {
      design: {
        solid: 'text-muted-foreground data-[active=true]:text-foreground',
        glass: 'text-current opacity-76 hover:opacity-100 data-[active=true]:opacity-100',
        liquidGlass:
          'text-zinc-700 opacity-82 hover:text-zinc-950 hover:opacity-100 data-[active=true]:text-zinc-950 data-[active=true]:opacity-100 dark:text-zinc-200 dark:hover:text-white dark:data-[active=true]:text-white',
        telegramGlass:
          'text-zinc-700 opacity-82 hover:text-zinc-950 hover:opacity-100 data-[active=true]:text-zinc-950 data-[active=true]:opacity-100 dark:text-zinc-200 dark:hover:text-white dark:data-[active=true]:text-white',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
      },
      fullWidth: {
        true: 'flex-1',
        false: '',
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
      size: 'md',
      fullWidth: false,
    },
  },
)

export const tabsActiveIndicatorVariants = cva(
  'pointer-events-none absolute inset-0 overflow-hidden rounded-full border [transform:translateZ(0)]',
  {
    variants: {
      design: {
        solid: 'border-border bg-background shadow-sm',
        glass:
          'border-white/[0.58] bg-white/[0.54] shadow-[0_12px_30px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl',
        liquidGlass: [
          'border-white/[0.72] bg-[radial-gradient(circle_at_var(--tab-pointer-x,18%)_var(--tab-pointer-y,0%),rgba(255,255,255,1),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.24)_54%,rgba(153,246,228,0.42))]',
          'shadow-[0_16px_40px_rgba(20,184,166,0.20),0_8px_18px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.34)] backdrop-blur-xl backdrop-saturate-200',
        ],
        telegramGlass: [
          'border-white/[0.62] bg-[radial-gradient(circle_at_var(--tab-pointer-x,18%)_var(--tab-pointer-y,0%),rgba(255,255,255,0.92),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.26))]',
          'shadow-[0_12px_30px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.94),inset_0_-1px_0_rgba(255,255,255,0.26)] backdrop-blur-xl backdrop-saturate-200',
        ],
      },
    },
    defaultVariants: {
      design: 'liquidGlass',
    },
  },
)

export const tabsContentVariants = cva(
  [
    'mt-3 outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  {
    variants: {
      inset: {
        true: 'rounded-2xl border border-white/[0.16] bg-white/[0.04] p-4 backdrop-blur-sm',
        false: '',
      },
    },
    defaultVariants: {
      inset: false,
    },
  },
)
