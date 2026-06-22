import { ExternalLink } from 'lucide-react'

import { mediaCardItems } from '../../../constants'
import { inlineActionVariants } from '../../../config'
import { inlineCardItems } from '../../../mocks'
import { InlineDemoContent, MediaDemoContent } from '../../content'
import { DemoMedia } from './demo-media'
import { ShadixReferencePreview } from './shadix-reference-preview'
import type { ResizableCardShowcaseState } from '../../../types'
import type { ComponentProps } from 'react'
import { ResizableCards, type ResizableCardItem } from '@/components/resizable-card'

type ExpandedSize = NonNullable<ComponentProps<typeof ResizableCards>['expandedSize']>

interface ResizableCardPreviewProps {
  state: ResizableCardShowcaseState
  expandedSize: ExpandedSize
}

export function ResizableCardPreview({ state, expandedSize }: ResizableCardPreviewProps) {
  const usesMediaData = state.presentation === 'media'
  const cardItems = usesMediaData ? mediaCardItems : inlineCardItems

  const mediaRenderProps =
    state.presentation === 'inline'
      ? {
          renderMedia: (item: ResizableCardItem, renderState: { expanded: boolean }) =>
            state.showMedia ? <DemoMedia id={item.id} expanded={renderState.expanded} /> : null,
        }
      : state.showMedia
        ? {}
        : {
            renderMedia: () => null,
          }

  const actionRenderProps =
    state.presentation === 'inline'
      ? {
          renderAction: (item: ResizableCardItem, renderState: { expanded: boolean }) =>
            state.showAction ? (
              <span className={inlineActionVariants({ variant: state.variant })}>
                {renderState.expanded ? 'Expanded' : item.ctaText}
                <ExternalLink className="size-3.5" />
              </span>
            ) : null,
        }
      : state.showAction
        ? {}
        : {
            renderAction: () => null,
          }

  return (
    <>
      <div className="min-w-0 rounded-lg border border-border bg-muted/40 p-5">
        <ResizableCards
          items={cardItems}
          presentation={state.presentation}
          animationPreset={state.animationPreset}
          variant={state.variant}
          size={state.size}
          actionVariant={state.variant}
          actionSize={state.size}
          iconButtonVariant={state.variant}
          iconButtonSize={state.size}
          resizable={state.resizable}
          closeOnBackdropClick={state.closeOnBackdropClick}
          closeOnEscape={state.closeOnEscape}
          lockBodyScroll={state.lockBodyScroll}
          compactSize={{
            width: '100%',
            minHeight: `${state.compactMinHeight}px`,
          }}
          expandedSize={expandedSize}
          {...mediaRenderProps}
          {...actionRenderProps}
          renderContent={(item: ResizableCardItem) =>
            usesMediaData ? (
              <MediaDemoContent item={item} density={state.density} />
            ) : (
              <InlineDemoContent item={item} density={state.density} />
            )
          }
        />
      </div>

      <ShadixReferencePreview />
    </>
  )
}
