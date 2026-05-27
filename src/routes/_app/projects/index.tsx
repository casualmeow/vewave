import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '@/modules/projects'

export const Route = createFileRoute('/_app/projects/')({
  component: ProjectsPage,
})
