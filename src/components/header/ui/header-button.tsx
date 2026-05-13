import { type Ref, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { headerButtonVariants } from '../constants'
import { cn } from '@/shared/lib/utils'

export interface HeaderButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof headerButtonVariants>, 'fullWidth'> {
  ref?: Ref<HTMLButtonElement>
  fullWidth?: boolean
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
}

export function HeaderButton({
  ref,
  className,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  startIcon,
  endIcon,
  children,
  type = 'button',
  ...props
}: HeaderButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      data-slot="header-button"
      data-loading={loading ? 'true' : 'false'}
      type={type}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(headerButtonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : startIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {startIcon}
        </span>
      ) : null}

      {size === 'icon' ? loading ? null : children : <span className="truncate">{children}</span>}

      {!loading && endIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {endIcon}
        </span>
      ) : null}
    </button>
  )
}
