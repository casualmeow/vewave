import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/modules/auth'

export const Route = createFileRoute('/(auth)/login/')({
  component: LoginForm,
})
