import { Link } from '@tanstack/react-router'
import { AuthPageLayout } from './auth-page-layout'
import { RegistrationForm } from './registration-form'

export function SignUpPage() {
  return (
    <AuthPageLayout
      title="Create your account"
      titleId="sign-up-title"
      description="Your next watch starts here."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/sign-in" search={{ redirectTo: undefined }}>
            Sign in
          </Link>
        </>
      }
    >
      <RegistrationForm />
    </AuthPageLayout>
  )
}
