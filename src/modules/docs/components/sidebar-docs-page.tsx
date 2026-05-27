import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'
import { SidebarShowcaseSection } from '@/modules/ui-showcase'

export function SidebarDocsPage() {
  return <ComponentDocPage doc={componentDocs.sidebar} showcase={<SidebarShowcaseSection />} />
}
