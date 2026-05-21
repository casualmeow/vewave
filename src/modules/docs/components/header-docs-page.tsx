import { componentDocs } from '../content/component-docs-content'
import { ComponentDocPage } from './component-doc-page'

export function HeaderDocsPage() {
  return <ComponentDocPage doc={componentDocs.header} />
}
