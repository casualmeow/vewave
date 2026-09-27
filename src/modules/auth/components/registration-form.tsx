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
import { SecureInput } from '@/shared/ui/secure-input'

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
    <div className="w-full space-y-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          aria-labelledby="sign-up-title"
          noValidate
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Your name"
                    autoComplete="name"
                    className="h-12 rounded-lg bg-background/60 px-3.5 shadow-none"
                  />
                </FormControl>
                <FormMessage role="alert" />
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
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="h-12 rounded-lg bg-background/60 px-3.5 shadow-none"
                  />
                </FormControl>
                <FormDescription>Password must be at least 8 characters long.</FormDescription>
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
            {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Form>
      <AuthFormDivider />
      <div className="space-y-2">
        <OAuthButtons layout="compact" />
        <PasskeyButton
          mode="sign-up"
          presentation="quiet"
          getRegistrationInput={getPasskeyRegistrationInput}
        />
      </div>
    </div>
  )
}
