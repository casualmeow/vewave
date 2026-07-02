import { createFileRoute } from '@tanstack/react-router'
import { requireAuthRoute } from '@/modules/auth/guards/auth-route'
import { ProjectsPage } from '@/modules/projects'

export const Route = createFileRoute('/_app/projects/')({
  beforeLoad: ({ location }) => requireAuthRoute(location),
  component: ProjectsPage,
})
