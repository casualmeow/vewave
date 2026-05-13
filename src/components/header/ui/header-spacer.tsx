import { type Ref, type HTMLAttributes } from 'react'
import { HEADER_HEIGHT } from '../constants'
import { type HeaderSize } from '../types'

export interface HeaderSpacerProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
  size?: HeaderSize
  topOffset?: number
  extraOffset?: number
}

export function HeaderSpacer({
  ref,
  className,
  style,
  size = 'md',
  topOffset = 12,
  extraOffset = 20,
  ...props
}: HeaderSpacerProps) {
  return (
    <div
      ref={ref}
      data-slot="header-spacer"
      aria-hidden="true"
      className={className}
      style={{
        ...style,
        height: HEADER_HEIGHT[size] + topOffset + extraOffset,
      }}
      {...props}
    />
  )
}
