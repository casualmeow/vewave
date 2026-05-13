import { cva } from 'class-variance-authority'

export const expandableCardVariants = cva(
  [
    'group flex w-full items-center justify-between gap-4',
    'border text-left shadow-sm transition',
    'hover:-translate-y-0.5 hover:shadow-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground hover:bg-accent/40',
        secondary:
          'border-secondary/35 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        ghost:
          'border-transparent bg-transparent text-foreground shadow-none hover:bg-accent hover:text-accent-foreground',
        destructive:
          'border-destructive/25 bg-destructive/10 text-foreground hover:bg-destructive/15',
      },
      size: {
        sm: 'min-h-20 rounded-2xl p-3',
        default: 'min-h-28 rounded-3xl p-4',
        lg: 'min-h-32 rounded-[2rem] p-5',
      },
      active: {
        true: 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      active: false,
    },
  },
)

export const expandableDialogVariants = cva(
  ['relative flex max-h-full max-w-full flex-col overflow-hidden', 'border shadow-2xl'],
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground',
        secondary: 'border-secondary/35 bg-secondary text-secondary-foreground',
        outline: 'border-input bg-background text-foreground',
        ghost: 'border-border/80 bg-background/95 text-foreground backdrop-blur',
        destructive: 'border-destructive/25 bg-card text-card-foreground',
      },
      size: {
        sm: 'rounded-2xl',
        default: 'rounded-3xl',
        lg: 'rounded-[2rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const expandableActionVariants = cva(
  [
    'inline-flex items-center justify-center rounded-full',
    'font-semibold transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        ghost: 'bg-accent/60 text-accent-foreground hover:bg-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        default: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-sm',
      },
      mode: {
        compact: '',
        expanded: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        mode: 'compact',
        className:
          'bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground',
      },
      {
        variant: 'secondary',
        mode: 'compact',
        className: 'bg-secondary text-secondary-foreground group-hover:bg-secondary/80',
      },
      {
        variant: 'destructive',
        mode: 'compact',
        className:
          'bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      mode: 'compact',
    },
  },
)

export const expandableIconButtonVariants = cva(
  [
    'grid place-items-center rounded-full border shadow-sm backdrop-blur transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-background/90 text-foreground hover:bg-background',
        secondary:
          'border-secondary/35 bg-secondary/90 text-secondary-foreground hover:bg-secondary',
        outline: 'border-input bg-background/90 text-foreground hover:bg-accent',
        ghost: 'border-transparent bg-background/70 text-foreground hover:bg-accent',
        destructive:
          'border-destructive/25 bg-background/90 text-destructive hover:bg-destructive/10',
      },
      size: {
        sm: 'h-8 w-8',
        default: 'h-9 w-9',
        lg: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const expandableContentVariants = cva('min-h-0 flex-1 overflow-auto p-5 text-sm leading-7', {
  variants: {
    variant: {
      default: 'text-muted-foreground',
      secondary: 'text-secondary-foreground/80',
      outline: 'text-muted-foreground',
      ghost: 'text-muted-foreground',
      destructive: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const expandableResizeHandleVariants = cva(
  [
    'absolute bottom-2 right-2 z-20 grid cursor-nwse-resize place-items-center',
    'rounded-lg transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ],
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        secondary:
          'text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground',
        outline: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        destructive: 'text-destructive/80 hover:bg-destructive/10 hover:text-destructive',
      },
      size: {
        sm: 'h-7 w-7',
        default: 'h-8 w-8',
        lg: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
