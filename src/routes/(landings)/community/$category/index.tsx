import { createFileRoute } from '@tanstack/react-router'

import { ForumCategoryPage } from '@/modules/community'

export const Route = createFileRoute('/(landings)/community/$category/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { category } = Route.useParams()

  return <ForumCategoryPage category={category} />
}
