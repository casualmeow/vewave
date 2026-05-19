import { afterEach, describe, expect, it } from 'vitest'
import { initialAuthState, useAuthStore } from './auth-store'

const user = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Jane Doe',
  email: 'jane@example.com',
}

describe('auth store', () => {
  afterEach(() => {
    useAuthStore.setState(initialAuthState)
  })

  it('stores authenticated session state', () => {
    useAuthStore.getState().setAuthenticated(user, 'access-token')

    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      user,
      accessToken: 'access-token',
    })
  })

  it('clears session state when anonymous', () => {
    useAuthStore.getState().setAuthenticated(user, 'access-token')
    useAuthStore.getState().setAnonymous()

    expect(useAuthStore.getState()).toMatchObject({
      status: 'anonymous',
      user: null,
      accessToken: null,
    })
  })
})
