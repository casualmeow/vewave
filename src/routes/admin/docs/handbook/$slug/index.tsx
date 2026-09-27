import { createFileRoute } from '@tanstack/react-router'
import { HandbookPage } from '@/modules/docs/components/handbook-page'
import { getHandbookDocument } from '@/modules/docs/content/handbook-content'

export const Route = createFileRoute('/admin/docs/handbook/$slug/')({
  loader: ({ params }) => {
    getHandbookDocument(params.slug)
  },
  component: HandbookRoute,
})

function HandbookRoute() {
  const { slug } = Route.useParams()
  return <HandbookPage slug={slug} />
}
