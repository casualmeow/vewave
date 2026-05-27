import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'

export function SidebarDocsPage() {
  return <ComponentDocPage doc={componentDocs.sidebar} />
}
