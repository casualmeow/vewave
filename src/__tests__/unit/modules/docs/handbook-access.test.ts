import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAdminRoute } from '@/modules/auth/guards/admin-route'

const state = vi.hoisted(() => ({
  status: 'anonymous',
  accessToken: null as string | null,
  user: null as { id: string; isAdmin: boolean } | null,
  setBootstrapping: vi.fn(),
  setAccessToken: vi.fn(),
  setAuthenticated: vi.fn(),
  setAnonymous: vi.fn(),
}))
const refresh = vi.hoisted(() => vi.fn())
vi.mock('@/modules/auth/model', () => ({ useAuthStore: { getState: () => state } }))
vi.mock('@/core/api/http/refresh-session', () => ({ refreshSessionOnce: refresh }))
vi.mock('@/core/api/generated/auth/auth', () => ({ getApiAuthMe: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
  state.status = 'anonymous'
  state.accessToken = null
  state.user = null
})

describe('handbook admin access', () => {
  const location = { href: '/admin/docs/handbook/glass-motion' }

  it('keeps the intended page when redirecting an anonymous reader', async () => {
    refresh.mockRejectedValueOnce(new Error('No session'))
    await expect(requireAdminRoute(location)).rejects.toMatchObject({
      options: { to: '/sign-in', search: { redirectTo: location.href } },
    })
  })

  it('rejects authenticated non-admin readers', async () => {
    state.status = 'authenticated'
    state.user = { id: 'member', isAdmin: false }
    await expect(requireAdminRoute(location)).rejects.toMatchObject({
      options: { to: '/projects' },
    })
  })

  it('allows an administrator without a duplicate session request', async () => {
    state.status = 'authenticated'
    state.user = { id: 'admin', isAdmin: true }
    await expect(requireAdminRoute(location)).resolves.toEqual({ adminUser: state.user })
    expect(refresh).not.toHaveBeenCalled()
  })
})
