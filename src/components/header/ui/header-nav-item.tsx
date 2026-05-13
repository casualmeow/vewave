import { type Ref, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { headerNavItemVariants } from '../constants'
import { cn } from '@/shared/lib/utils'

export interface HeaderNavItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-current'>,
    Omit<VariantProps<typeof headerNavItemVariants>, 'active' | 'disabled'> {
  ref?: Ref<HTMLAnchorElement>
  active?: boolean
  disabled?: boolean
}

export function HeaderNavItem({
  ref,
  className,
  size = 'md',
  active = false,
  disabled = false,
  tabIndex,
  onClick,
  href,
  ...props
}: HeaderNavItemProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onClick?.(event)
  }

  return (
    <a
      ref={ref}
      data-slot="header-nav-item"
      data-active={active ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      href={disabled ? undefined : href}
      className={cn(headerNavItemVariants({ size, active, disabled }), className)}
      onClick={handleClick}
      {...props}
    />
  )
}
