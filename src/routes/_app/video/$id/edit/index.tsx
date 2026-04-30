import { createFileRoute } from '@tanstack/react-router'
import { VideoEditForm } from '@/modules/video/components'

export const Route = createFileRoute('/_app/video/$id/edit/')({
  component: VideoEditForm,
})
