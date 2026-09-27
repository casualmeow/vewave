import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/modules/auth/components/login-form'
import { OAuthButtons, PasskeyButton } from '@/modules/auth/components/oauth-buttons'
import { useAuthStore } from '@/modules/auth/model'

const { login, navigate, assign, supportsPasskey, authenticate, post, toastError } = vi.hoisted(
  () => ({
    login: vi.fn(),
    navigate: vi.fn(),
    assign: vi.fn(),
    supportsPasskey: vi.fn(),
    authenticate: vi.fn(),
    post: vi.fn(),
    toastError: vi.fn(),
  }),
)
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/core/api/generated/auth/auth', () => ({
  usePostApiAuthLogin: () => ({ mutateAsync: login }),
}))
vi.mock('@/core/api/http/client', () => ({ httpClient: { post } }))
vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: supportsPasskey,
  startAuthentication: authenticate,
  startRegistration: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: toastError } }))

const session = {
  user: {
    id: 'user-1',
    name: 'Alex',
    email: 'alex@example.com',
    username: null,
    avatarUrl: null,
    bio: null,
    isAdmin: false,
  },
  accessToken: 'test-access-token',
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().reset()
  vi.stubGlobal('location', { ...window.location, assign })
  login.mockResolvedValue(session)
  supportsPasskey.mockReturnValue(true)
})
afterEach(() => {
  cleanup()
  useAuthStore.getState().reset()
  vi.unstubAllGlobals()
})

function mount(redirectTo?: string) {
  render(
    <>
      <h1 id="sign-in-title">Sign in to Vewave</h1>
      <LoginForm redirectTo={redirectTo} />
    </>,
  )
  return screen.getByRole('form', { name: 'Sign in to Vewave' })
}
function fill() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alex@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'my-password' } })
}

describe('Sign-in form', () => {
  it('associates labels, autocomplete, inline errors and a keyboard-focusable password toggle', async () => {
    const form = mount()
    const email = screen.getByLabelText<HTMLInputElement>('Email')
    const password = screen.getByLabelText<HTMLInputElement>('Password')
    expect(email.autocomplete).toBe('email')
    expect(password.autocomplete).toBe('current-password')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    toggle.focus()
    expect(document.activeElement).toBe(toggle)
    expect(toggle.tabIndex).toBe(0)
    fireEvent.click(toggle)
    expect(password.type).toBe('text')
    expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    fireEvent.submit(form)
    expect(await screen.findAllByRole('alert')).toHaveLength(2)
    expect(login).not.toHaveBeenCalled()
    expect(password.getAttribute('aria-invalid')).toBe('true')
    const errorId = password.getAttribute('aria-describedby')!.split(' ').at(-1)!
    expect(document.getElementById(errorId)?.textContent).toBe('Password is required.')
  })

  it('submits credentials once, disables the pending action, and stores the returned session', async () => {
    let finish!: (value: typeof session) => void
    login.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const form = mount()
    fill()
    fireEvent.submit(form)
    const pending = await screen.findByRole('button', { name: 'Signing in…' })
    expect((pending as HTMLButtonElement).disabled).toBe(true)
    expect(login).toHaveBeenCalledExactlyOnceWith({
      data: { email: 'alex@example.com', password: 'my-password' },
    })
    await act(async () => {
      finish(session)
      await Promise.resolve()
    })
    expect(useAuthStore.getState().accessToken).toBe(session.accessToken)
    expect(navigate).toHaveBeenCalledWith({ to: '/projects' })
  })

  it.each(['/servers?joined=1', '/projects/room'])(
    'retains internal redirect %s',
    async (redirectTo) => {
      const form = mount(redirectTo)
      fill()
      fireEvent.submit(form)
      await waitFor(() => expect(assign).toHaveBeenCalledWith(redirectTo))
    },
  )

  it.each(['https://example.com', '//example.com'])(
    'rejects external redirect %s',
    async (redirectTo) => {
      const form = mount(redirectTo)
      fill()
      fireEvent.submit(form)
      await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/projects' }))
      expect(assign).not.toHaveBeenCalled()
    },
  )

  it('announces server errors and restores the submit action without losing input', async () => {
    login.mockRejectedValueOnce(new Error('Email or password is incorrect.'))
    const form = mount()
    fill()
    fireEvent.submit(form)
    expect((await screen.findByRole('alert')).textContent).toBe('Email or password is incorrect.')
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Sign in' }).disabled).toBe(false)
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe('alex@example.com')
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})

describe('Alternative sign-in actions', () => {
  it('preserves provider endpoints and the registration page’s default presentation', () => {
    const view = render(<OAuthButtons />)
    expect(screen.getByText('Continue with Google')).toBeDefined()
    view.rerender(<OAuthButtons layout="compact" />)
    for (const provider of ['Google', 'Discord', 'Microsoft']) {
      fireEvent.click(screen.getByRole('button', { name: `Continue with ${provider}` }))
      const url = new URL(assign.mock.calls.at(-1)![0] as string)
      expect(url.pathname).toBe(`/api/auth/oauth/${provider.toLowerCase()}/start`)
      expect(url.searchParams.get('redirectTo')).toBe('/projects')
    }
  })

  it('keeps the passkey session flow behind the quieter presentation', async () => {
    post
      .mockResolvedValueOnce({ data: { options: { challenge: 'challenge' } } })
      .mockResolvedValueOnce({ data: session })
    authenticate.mockResolvedValue({ id: 'credential' })
    render(<PasskeyButton mode="sign-in" presentation="quiet" />)
    fireEvent.click(screen.getByRole('button', { name: 'Use a passkey' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/projects' }))
    expect(authenticate).toHaveBeenCalledWith({ optionsJSON: { challenge: 'challenge' } })
    expect(post).toHaveBeenLastCalledWith('/api/auth/passkey/authentication/verify', {
      response: { id: 'credential' },
    })
    expect(useAuthStore.getState().user).toEqual(session.user)
  })

  it('does not start an unsupported passkey request', () => {
    supportsPasskey.mockReturnValue(false)
    render(<PasskeyButton mode="sign-in" presentation="quiet" />)
    fireEvent.click(screen.getByRole('button', { name: 'Use a passkey' }))
    expect(toastError).toHaveBeenCalledWith('Passkeys are not supported in this browser.')
    expect(post).not.toHaveBeenCalled()
  })
})
