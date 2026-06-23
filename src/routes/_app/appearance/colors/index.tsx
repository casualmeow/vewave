import { createFileRoute } from '@tanstack/react-router'
import { AppearanceColorStudioPage } from '@/modules/appearance'

export const Route = createFileRoute('/_app/appearance/colors/')({
  component: AppearanceColorStudioPage,
})
