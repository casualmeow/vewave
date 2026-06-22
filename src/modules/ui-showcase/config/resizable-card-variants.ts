import { cva } from 'class-variance-authority'

export const demoMediaVariants = cva(
  'grid place-items-center rounded-xl bg-gradient-to-br text-foreground',
  {
    variants: {
      size: {
        compact: 'size-16',
        expanded: 'h-28 w-full',
      },
      tone: {
        preview:
          'from-[color-mix(in_oklab,var(--primary)_36%,var(--background))] to-[color-mix(in_oklab,var(--accent)_34%,var(--background))]',
        content:
          'from-[color-mix(in_oklab,var(--accent)_42%,var(--background))] to-[color-mix(in_oklab,var(--primary)_26%,var(--secondary))]',
        interaction:
          'from-[color-mix(in_oklab,var(--success)_36%,var(--background))] to-[color-mix(in_oklab,var(--primary)_30%,var(--background))]',
      },
    },
    defaultVariants: {
      size: 'compact',
      tone: 'interaction',
    },
  },
)

export const inlineActionVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-input bg-background text-foreground',
        ghost: 'bg-transparent text-foreground ring-1 ring-border',
        destructive: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
