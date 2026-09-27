import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistrationForm } from '@/modules/auth/components/registration-form'
import { useAuthStore } from '@/modules/auth/model'

const { register, navigate, assign, supportsPasskey, registerPasskey, post, toastError } =
  vi.hoisted(() => ({
    register: vi.fn(),
    navigate: vi.fn(),
    assign: vi.fn(),
    supportsPasskey: vi.fn(),
    registerPasskey: vi.fn(),
    post: vi.fn(),
    toastError: vi.fn(),
  }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/core/api/generated/auth/auth', () => ({
  usePostApiAuthRegister: () => ({ mutateAsync: register }),
}))
vi.mock('@/core/api/http/client', () => ({ httpClient: { post } }))
vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: supportsPasskey,
  startAuthentication: vi.fn(),
  startRegistration: registerPasskey,
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
  register.mockReset().mockResolvedValue(session)
  registerPasskey.mockReset()
  post.mockReset()
  supportsPasskey.mockReturnValue(true)
})

afterEach(() => {
  cleanup()
  useAuthStore.getState().reset()
  vi.unstubAllGlobals()
})

function mount() {
  render(
    <>
      <h1 id="sign-up-title">Create your account</h1>
      <RegistrationForm />
    </>,
  )
  return screen.getByRole<HTMLFormElement>('form', { name: 'Create your account' })
}

function fillIdentity() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alex' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alex@example.com' } })
}

function fill() {
  fillIdentity()
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'my-password' } })
}

describe('Sign-up form', () => {
  it('associates native fields, password guidance, and a keyboard-focusable visibility toggle', () => {
    const form = mount()
    const name = screen.getByLabelText<HTMLInputElement>('Name')
    const email = screen.getByLabelText<HTMLInputElement>('Email')
    const password = screen.getByLabelText<HTMLInputElement>('Password')
    expect(form.noValidate).toBe(true)
    expect(name.autocomplete).toBe('name')
    expect(email.autocomplete).toBe('email')
    expect(email.type).toBe('email')
    expect(email.getAttribute('autocapitalize')).toBe('none')
    expect(email.getAttribute('spellcheck')).toBe('false')
    expect(password.autocomplete).toBe('new-password')
    expect(password.type).toBe('password')
    const description = document.getElementById(password.getAttribute('aria-describedby')!)
    expect(description?.textContent).toBe('Password must be at least 8 characters long.')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    toggle.focus()
    expect(document.activeElement).toBe(toggle)
    expect(toggle.getAttribute('aria-controls')).toBe(password.id)
    fireEvent.click(toggle)
    expect(password.type).toBe('text')
    const hide = screen.getByRole('button', { name: 'Hide password' })
    expect(hide.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(hide)
    expect(password.type).toBe('password')
    expect(register).not.toHaveBeenCalled()
  })

  it('announces invalid fields without calling registration', async () => {
    const form = mount()
    fireEvent.submit(form)
    expect(await screen.findAllByRole('alert')).toHaveLength(3)
    for (const label of ['Name', 'Email', 'Password']) {
      const field = screen.getByLabelText(label)
      expect(field.getAttribute('aria-invalid')).toBe('true')
      const errorId = field.getAttribute('aria-describedby')!.split(' ').at(-1)!
      expect(document.getElementById(errorId)?.getAttribute('role')).toBe('alert')
    }
    expect(register).not.toHaveBeenCalled()
    expect(post).not.toHaveBeenCalled()
  })

  it('disables the pending action, then saves the session and opens projects', async () => {
    let finish!: (value: typeof session) => void
    register.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const form = mount()
    fill()
    fireEvent.submit(form)
    const pending = await screen.findByRole<HTMLButtonElement>('button', {
      name: 'Creating account…',
    })
    expect(pending.disabled).toBe(true)
    expect(pending.getAttribute('aria-busy')).toBe('true')
    expect(register).toHaveBeenCalledExactlyOnceWith({
      data: { name: 'Alex', email: 'alex@example.com', password: 'my-password' },
    })
    await act(async () => {
      finish(session)
      await Promise.resolve()
    })
    expect(useAuthStore.getState().user).toEqual(session.user)
    expect(useAuthStore.getState().accessToken).toBe(session.accessToken)
    expect(navigate).toHaveBeenCalledWith({ to: '/projects' })
  })

  it('announces API errors and restores submission without losing entered values', async () => {
    register.mockRejectedValueOnce(new Error('This email is already registered.'))
    const form = mount()
    fill()
    fireEvent.submit(form)
    expect((await screen.findByRole('alert')).textContent).toBe('This email is already registered.')
    const submit = screen.getByRole<HTMLButtonElement>('button', { name: 'Create account' })
    expect(submit.disabled).toBe(false)
    expect(submit.getAttribute('aria-busy')).toBe('false')
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('Alex')
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe('alex@example.com')
    expect(screen.getByLabelText<HTMLInputElement>('Password').value).toBe('my-password')
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe('Alternative sign-up actions', () => {
  it('requires name and email before starting passkey registration', async () => {
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Create with Passkey' }))
    expect(await screen.findAllByRole('alert')).toHaveLength(2)
    expect(screen.getByLabelText('Name').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('Password').getAttribute('aria-invalid')).toBe('false')
    expect(post).not.toHaveBeenCalled()
    expect(registerPasskey).not.toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
  })

  it('registers a passkey with name and email while leaving password optional', async () => {
    post
      .mockResolvedValueOnce({ data: { options: { challenge: 'challenge' } } })
      .mockResolvedValueOnce({ data: session })
    registerPasskey.mockResolvedValue({ id: 'credential' })
    mount()
    fillIdentity()
    expect(screen.getByLabelText<HTMLInputElement>('Password').value).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Create with Passkey' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/projects' }))
    expect(post).toHaveBeenNthCalledWith(1, '/api/auth/passkey/register/options', {
      name: 'Alex',
      email: 'alex@example.com',
    })
    expect(registerPasskey).toHaveBeenCalledWith({ optionsJSON: { challenge: 'challenge' } })
    expect(post).toHaveBeenNthCalledWith(2, '/api/auth/passkey/register/verify', {
      response: { id: 'credential' },
    })
    expect(useAuthStore.getState().user).toEqual(session.user)
    expect(useAuthStore.getState().accessToken).toBe(session.accessToken)
    expect(register).not.toHaveBeenCalled()
  })

  it('restores the passkey action after a failed request without creating a session', async () => {
    post.mockRejectedValueOnce(new Error('Passkey registration was cancelled.'))
    mount()
    fillIdentity()
    fireEvent.click(screen.getByRole('button', { name: 'Create with Passkey' }))
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Passkey registration was cancelled.'),
    )
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Create with Passkey' }).disabled,
    ).toBe(false)
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe('alex@example.com')
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('keeps compact provider controls connected to their existing OAuth endpoints', () => {
    mount()
    for (const provider of ['Google', 'Discord', 'Microsoft']) {
      const button = screen.getByRole('button', { name: `Continue with ${provider}` })
      expect(button.textContent).toBe(provider)
      fireEvent.click(button)
      const url = new URL(assign.mock.calls.at(-1)![0] as string)
      expect(url.pathname).toBe(`/api/auth/oauth/${provider.toLowerCase()}/start`)
      expect(url.searchParams.get('redirectTo')).toBe('/projects')
    }
    expect(register).not.toHaveBeenCalled()
  })
})
