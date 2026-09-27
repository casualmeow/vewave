import { useState } from 'react'
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'
import { Fingerprint } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore, type AuthUser } from '../model'
import { DiscordMark, GoogleMark, MicrosoftMark } from './provider-marks'
import { httpClient } from '@/core/api/http/client'
import { getApiErrorMessage } from '@/core/api/http/errors'
import { apiUrl } from '@/shared/config'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type OAuthProvider = 'google' | 'discord' | 'microsoft'

type AuthSessionResponse = {
  user: AuthUser
  accessToken: string
}

type PasskeyOptionsResponse<TOptions> = {
  options: TOptions
}

type PasskeyRegistrationInput = {
  name: string
  email: string
}

const providers = [
  {
    id: 'google',
    label: 'Google',
    Icon: GoogleMark,
  },
  {
    id: 'discord',
    label: 'Discord',
    Icon: DiscordMark,
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    Icon: MicrosoftMark,
  },
] satisfies Array<{
  id: OAuthProvider
  label: string
  Icon: typeof GoogleMark
}>

function buildOAuthStartUrl(provider: OAuthProvider) {
  const url = new URL(`/api/auth/oauth/${provider}/start`, apiUrl)
  url.searchParams.set('redirectTo', '/projects')
  return url.toString()
}

export function OAuthButtons({ layout = 'stack' }: { layout?: 'stack' | 'compact' }) {
  return (
    <div className={cn('grid gap-3', layout === 'compact' && 'grid-cols-3 gap-2')}>
      {providers.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className={cn(
            'w-full',
            layout === 'compact' && 'h-11 min-w-0 rounded-lg px-2 shadow-none has-[>svg]:px-2',
          )}
          aria-label={`Continue with ${label}`}
          title={`Continue with ${label}`}
          onClick={() => {
            window.location.assign(buildOAuthStartUrl(id))
          }}
        >
          <Icon />
          {layout === 'compact' ? (
            <span className="hidden min-[420px]:inline text-xs">{label}</span>
          ) : (
            `Continue with ${label}`
          )}
        </Button>
      ))}
    </div>
  )
}

async function registerWithPasskey(input: PasskeyRegistrationInput) {
  const { data: optionsResponse } = await httpClient.post<
    PasskeyOptionsResponse<PublicKeyCredentialCreationOptionsJSON>
  >('/api/auth/passkey/register/options', input)
  const response = await startRegistration({
    optionsJSON: optionsResponse.options,
  })
  const { data } = await httpClient.post<AuthSessionResponse>('/api/auth/passkey/register/verify', {
    response,
  })

  return data
}

async function authenticateWithPasskey() {
  const { data: optionsResponse } = await httpClient.post<
    PasskeyOptionsResponse<PublicKeyCredentialRequestOptionsJSON>
  >('/api/auth/passkey/authentication/options')
  const response = await startAuthentication({
    optionsJSON: optionsResponse.options,
  })
  const { data } = await httpClient.post<AuthSessionResponse>(
    '/api/auth/passkey/authentication/verify',
    {
      response,
    },
  )

  return data
}

type PasskeyButtonProps = { presentation?: 'default' | 'quiet' } & (
  | {
      mode: 'sign-in'
      getRegistrationInput?: never
    }
  | {
      mode: 'sign-up'
      getRegistrationInput: () => PasskeyRegistrationInput | null
    }
)

export function PasskeyButton(props: PasskeyButtonProps) {
  const navigate = useNavigate()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const [isPending, setIsPending] = useState(false)
  const label =
    props.mode === 'sign-in'
      ? props.presentation === 'quiet'
        ? 'Use a passkey'
        : 'Continue with Passkey'
      : 'Create with Passkey'

  async function handlePasskey() {
    if (!browserSupportsWebAuthn()) {
      toast.error('Passkeys are not supported in this browser.')
      return
    }

    try {
      setIsPending(true)

      let session: AuthSessionResponse

      if (props.mode === 'sign-up') {
        const input = props.getRegistrationInput()
        if (!input) return

        session = await registerWithPasskey(input)
      } else {
        session = await authenticateWithPasskey()
      }

      setAuthenticated(session.user, session.accessToken)
      toast.success(props.mode === 'sign-up' ? 'Account created' : 'Signed in')
      await navigate({ to: '/projects' })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Passkey authentication failed.'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant={props.presentation === 'quiet' ? 'ghost' : 'outline'}
      className={cn(
        'w-full',
        props.presentation === 'quiet' && 'h-11 rounded-lg text-muted-foreground',
      )}
      disabled={isPending}
      onClick={handlePasskey}
    >
      <Fingerprint aria-hidden="true" className="size-4" />
      {isPending ? 'Waiting for passkey...' : label}
    </Button>
  )
}

export function AuthFormDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <span>or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
