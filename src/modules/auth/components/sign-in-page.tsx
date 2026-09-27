import { Link } from '@tanstack/react-router'
import { AuthPageLayout } from './auth-page-layout'
import { LoginForm } from './login-form'

export function SignInPage({ redirectTo }: { redirectTo?: string }) {
  return (
    <AuthPageLayout
      title="Sign in to Vewave"
      titleId="sign-in-title"
      description="Continue to your rooms and projects."
      footer={
        <>
          New here? <Link to="/sign-up">Create an account</Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthPageLayout>
  )
}
