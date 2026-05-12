import { createFileRoute } from '@tanstack/react-router'
import { VideoEditForm } from '@/modules/video/components'

export const Route = createFileRoute('/_studio/video/$id/edit/')({
  component: VideoEditForm,
})
