import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'
import { ResizableCardShowcaseSection } from '@/modules/ui-showcase'

export function ResizableCardDocsPage() {
  return (
    <ComponentDocPage
      doc={componentDocs['resizable-card']}
      showcase={<ResizableCardShowcaseSection />}
    />
  )
}
