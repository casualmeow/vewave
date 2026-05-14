import { cva } from 'class-variance-authority'

export const demoMediaVariants = cva(
  'grid place-items-center rounded-xl bg-gradient-to-br text-zinc-950',
  {
    variants: {
      size: {
        compact: 'size-16',
        expanded: 'h-28 w-full',
      },
      tone: {
        preview: 'from-teal-300 to-sky-400',
        content: 'from-violet-300 to-fuchsia-400',
        interaction: 'from-lime-300 to-emerald-400',
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
