import { createFileRoute } from '@tanstack/react-router'

import { ForumThreadPage } from '@/modules/community'

export const Route = createFileRoute('/(landings)/community/$category/$threadId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { category, threadId } = Route.useParams()

  return <ForumThreadPage category={category} threadId={threadId} />
}
