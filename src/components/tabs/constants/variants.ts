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
          'border-[color:var(--glass-border)] bg-[var(--glass-background)] text-foreground shadow-[0_18px_48px_color-mix(in_srgb,var(--foreground)_12%,transparent),inset_0_1px_0_var(--glass-highlight)]',
        ],
        liquidGlass: [
          'border-[color:var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--glass-highlight)_70%,transparent),var(--glass-background)_46%,color-mix(in_srgb,var(--accent)_24%,transparent))] text-foreground',
          'shadow-[0_24px_76px_color-mix(in_srgb,var(--foreground)_20%,transparent),0_10px_30px_color-mix(in_srgb,var(--accent)_16%,transparent),inset_0_1px_0_var(--glass-highlight)]',
        ],
        telegramGlass: [
          'border-[color:var(--glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--glass-highlight)_56%,transparent),var(--glass-background))] text-foreground',
          'shadow-[0_18px_56px_color-mix(in_srgb,var(--foreground)_16%,transparent),inset_0_1px_0_var(--glass-highlight)]',
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
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-45 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45',
  ],
  {
    variants: {
      design: {
        solid: 'text-muted-foreground data-[active=true]:text-foreground',
        glass: 'text-current opacity-76 hover:opacity-100 data-[active=true]:opacity-100',
        liquidGlass:
          'text-muted-foreground opacity-82 hover:text-foreground hover:opacity-100 data-[active=true]:text-foreground data-[active=true]:opacity-100',
        telegramGlass:
          'text-muted-foreground opacity-82 hover:text-foreground hover:opacity-100 data-[active=true]:text-foreground data-[active=true]:opacity-100',
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
          'border-[color:var(--glass-border)] bg-[var(--tabs-active)] shadow-[0_12px_30px_color-mix(in_srgb,var(--foreground)_12%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl',
        liquidGlass: [
          'border-[color:var(--glass-border)] bg-[radial-gradient(circle_at_var(--tab-pointer-x,18%)_var(--tab-pointer-y,0%),var(--glass-highlight),transparent_36%),linear-gradient(135deg,var(--tabs-active),var(--glass-background)_54%,color-mix(in_srgb,var(--accent)_28%,transparent))]',
          'shadow-[0_16px_40px_color-mix(in_srgb,var(--accent)_20%,transparent),0_8px_18px_color-mix(in_srgb,var(--foreground)_12%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-200',
        ],
        telegramGlass: [
          'border-[color:var(--glass-border)] bg-[radial-gradient(circle_at_var(--tab-pointer-x,18%)_var(--tab-pointer-y,0%),var(--glass-highlight),transparent_38%),linear-gradient(180deg,var(--tabs-active),var(--glass-background))]',
          'shadow-[0_12px_30px_color-mix(in_srgb,var(--foreground)_14%,transparent),inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl backdrop-saturate-200',
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
        true: 'rounded-2xl border border-border bg-card p-4 backdrop-blur-sm',
        false: '',
      },
    },
    defaultVariants: {
      inset: false,
    },
  },
)
