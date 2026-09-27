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

type LoginFormProps = {
  redirectTo?: string
}

const defaultRedirectPath = '/projects'

const getSafeRedirectPath = (value?: string) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return defaultRedirectPath
  }

  return value
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
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
      const nextPath = getSafeRedirectPath(redirectTo)

      if (nextPath === defaultRedirectPath) {
        await navigate({ to: defaultRedirectPath })
      } else {
        window.location.assign(nextPath)
      }
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'Unable to sign in.'),
      })
    }
  }

  return (
    <div className="w-full space-y-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          aria-labelledby="sign-in-title"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="h-12 rounded-lg bg-background/60 px-3.5 shadow-none"
                  />
                </FormControl>
                <FormMessage role="alert" />
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
                  <SecureInput
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 rounded-lg bg-background/60 px-3.5 shadow-none"
                  />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />
          {form.formState.errors.root ? (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-12 w-full rounded-lg shadow-none"
            disabled={form.formState.isSubmitting}
            aria-busy={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>
      <AuthFormDivider />
      <div className="space-y-2">
        <OAuthButtons layout="compact" />
        <PasskeyButton mode="sign-in" presentation="quiet" />
      </div>
    </div>
  )
}
