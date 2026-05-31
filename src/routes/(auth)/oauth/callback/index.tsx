import { createFileRoute } from '@tanstack/react-router'
import { OAuthCallbackPage } from '@/modules/auth'

export const Route = createFileRoute('/(auth)/oauth/callback/')({
  component: OAuthCallbackPage,
})
