import { type CSSLength } from '../types'

export function toWidth(value: CSSLength) {
  return typeof value === 'number' ? `${Math.max(0, value)}%` : value
}

export function toLength(value?: CSSLength) {
  if (value == null) return undefined
  return typeof value === 'number' ? `${value}px` : value
}
