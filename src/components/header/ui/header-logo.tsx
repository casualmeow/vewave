import { type Ref, type ReactNode, type AnchorHTMLAttributes, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

type HeaderLogoBaseProps = {
  icon?: ReactNode
  text?: ReactNode
  children?: ReactNode
}

export type HeaderLogoLinkProps = HeaderLogoBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> & {
    ref?: Ref<HTMLAnchorElement>
    href?: string
  }

export type HeaderLogoStaticProps = HeaderLogoBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    ref?: Ref<HTMLSpanElement>
    href: null
  }

export type HeaderLogoProps = HeaderLogoLinkProps | HeaderLogoStaticProps

export function HeaderLogo(props: HeaderLogoProps) {
  const { className, icon, text, children } = props

  const content = children ?? (
    <>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {text ? <span className="truncate whitespace-nowrap">{text}</span> : null}
    </>
  )

  const baseClasses = cn(
    'inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight',
    className,
  )

  const interactiveClasses = cn(
    baseClasses,
    'outline-none transition-opacity hover:opacity-85',
    'focus-visible:ring-2 focus-visible:ring-white/[0.35] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  )

  if (props.href === null) {
    const {
      children: _children,
      className: _className,
      href: _href,
      icon: _icon,
      ref,
      text: _text,
      ...spanProps
    } = props

    return (
      <span ref={ref} data-slot="header-logo" className={baseClasses} {...spanProps}>
        {content}
      </span>
    )
  }

  const {
    children: _children,
    className: _className,
    href = '/',
    icon: _icon,
    ref,
    text: _text,
    ...anchorProps
  } = props

  return (
    <a
      ref={ref}
      data-slot="header-logo"
      href={href}
      className={interactiveClasses}
      {...anchorProps}
    >
      {content}
    </a>
  )
}
