import { createFileRoute } from '@tanstack/react-router'
import { SignUpPage } from '@/modules/auth'

export const Route = createFileRoute('/(auth)/sign-up/')({
  component: SignUpPage,
})
