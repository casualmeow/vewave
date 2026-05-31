import { createFileRoute } from '@tanstack/react-router'
import { RegistrationForm } from '@/modules/auth'

export const Route = createFileRoute('/(auth)/sign-up/')({
  component: RegistrationForm,
})
