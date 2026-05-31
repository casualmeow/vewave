import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { passkeyRegistrationSchema, registrationSchema, type RegistrationFields } from '../schema'
import { useAuthStore } from '../model'
import { AuthFormDivider, OAuthButtons, PasskeyButton } from './oauth-buttons'
import { usePostApiAuthRegister } from '@/core/api/generated/auth/auth'
import { getApiErrorMessage } from '@/core/api/http/errors'
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui'

export const RegistrationForm = () => {
  const navigate = useNavigate()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const registerMutation = usePostApiAuthRegister()
  const form = useForm<RegistrationFields>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: RegistrationFields) {
    try {
      const response = await registerMutation.mutateAsync({ data: values })
      setAuthenticated(response.user, response.accessToken)
      toast.success('Account created')
      await navigate({ to: '/projects' })
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'Unable to create your account.'),
      })
    }
  }

  function getPasskeyRegistrationInput() {
    const result = passkeyRegistrationSchema.safeParse({
      name: form.getValues('name'),
      email: form.getValues('email'),
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'name' || field === 'email') {
          form.setError(field, { message: issue.message })
        }
      }

      return null
    }

    return result.data
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="grid gap-3">
        <OAuthButtons />
        <PasskeyButton mode="sign-up" getRegistrationInput={getPasskeyRegistrationInput} />
      </div>
      <AuthFormDivider />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your password" type="password" {...field} />
                </FormControl>
                <FormDescription>Password must be at least 8 characters long.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root ? (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
