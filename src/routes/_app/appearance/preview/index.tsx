import { createFileRoute } from '@tanstack/react-router'
import { AppearancePreviewWorkbench } from '@/modules/appearance'

export const Route = createFileRoute('/_app/appearance/preview/')({
  component: AppearancePreviewWorkbench,
})
