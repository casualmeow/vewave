import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { loginSchema, type LoginFields } from '../schema'
import { useAuthStore } from '../model'
import { AuthFormDivider, OAuthButtons, PasskeyButton } from './oauth-buttons'
import { usePostApiAuthLogin } from '@/core/api/generated/auth/auth'
import { getApiErrorMessage } from '@/core/api/http/errors'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui'
import { SecureInput } from '@/shared/ui/secure-input'

export const LoginForm = () => {
  const navigate = useNavigate()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const loginMutation = usePostApiAuthLogin()
  const form = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFields) {
    try {
      const response = await loginMutation.mutateAsync({ data: values })
      setAuthenticated(response.user, response.accessToken)
      toast.success('Signed in')
      await navigate({ to: '/projects' })
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'Unable to sign in.'),
      })
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="grid gap-3">
        <OAuthButtons />
        <PasskeyButton mode="sign-in" />
      </div>
      <AuthFormDivider />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="you@example.com" type="email" />
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
                <div className="relative">
                  <FormControl>
                    <div className="relative">
                      <SecureInput {...field} placeholder="Enter your password" />
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root ? (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
