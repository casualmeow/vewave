import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'
import { HeaderShowcaseSection } from '@/modules/ui-showcase'

export function HeaderDocsPage() {
  return <ComponentDocPage doc={componentDocs.header} showcase={<HeaderShowcaseSection />} />
}
