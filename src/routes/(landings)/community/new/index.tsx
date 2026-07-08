import { createFileRoute } from '@tanstack/react-router'

import { ForumNewThreadPage } from '@/modules/community'

export const Route = createFileRoute('/(landings)/community/new/')({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === 'string' ? search.category : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { category } = Route.useSearch()

  return <ForumNewThreadPage initialCategory={category} />
}
