import { expandableActionVariants } from '../constants'
import type {
  CardRenderState,
  ExpandableCardItem,
  ExpandableCardSizeVariant,
  ExpandableCardVariant,
} from '../types'

type DefaultMediaProps<T extends ExpandableCardItem> = {
  item: T
  state: CardRenderState
}

export function DefaultMedia<T extends ExpandableCardItem>({ item, state }: DefaultMediaProps<T>) {
  if (!item.src) return null

  return (
    <img
      src={item.src}
      alt={item.imageAlt ?? ''}
      className={
        state.expanded
          ? 'h-64 w-full object-cover object-top'
          : 'h-20 w-20 shrink-0 rounded-2xl object-cover object-top'
      }
    />
  )
}

type DefaultActionProps<T extends ExpandableCardItem> = {
  item: T
  state: CardRenderState
  variant: ExpandableCardVariant
  size: ExpandableCardSizeVariant
}

export function DefaultAction<T extends ExpandableCardItem>({
  item,
  state,
  variant,
  size,
}: DefaultActionProps<T>) {
  if (!item.ctaText) return null

  const className = expandableActionVariants({
    variant,
    size,
    mode: state.expanded ? 'expanded' : 'compact',
  })

  if (state.expanded && item.ctaLink) {
    return (
      <a href={item.ctaLink} target="_blank" rel="noreferrer" className={className}>
        {item.ctaText}
      </a>
    )
  }

  return <span className={className}>{item.ctaText}</span>
}
