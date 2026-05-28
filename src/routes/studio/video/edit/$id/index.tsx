import { createFileRoute } from '@tanstack/react-router'

import { VideoEditForm } from '@/modules/video/components'

export const Route = createFileRoute('/studio/video/edit/$id/')({
  component: VideoEditForm,
})
