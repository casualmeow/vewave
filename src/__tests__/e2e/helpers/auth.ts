import type { Page } from '@playwright/test'

const e2eUser = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'E2E User',
  email: 'e2e@example.com',
  username: 'e2e-user',
  avatarUrl: null,
  bio: null,
  isAdmin: false,
  appConfig: {},
}

const defaultSavedRooms = [
  {
    code: 'REAL1',
    title: 'Saved auth room',
    role: 'owner',
    status: 'active',
    visibility: 'unlisted',
    provider: 'youtube',
    createdAt: '2026-05-19T12:00:00.000Z',
    lastOpenedAt: '2026-05-19T12:00:00.000Z',
  },
]

export async function authenticateE2EUser(page: Page) {
  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'e2e-access-token' }),
    })
  })

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: e2eUser }),
    })
  })
}

export async function seedE2ESavedRooms(page: Page) {
  await page.addInitScript(
    ({ rooms, userId }) => {
      window.localStorage.setItem(
        `vewave:saved-rooms:v1:${encodeURIComponent(`user:${userId}`)}`,
        JSON.stringify(rooms),
      )
    },
    { rooms: defaultSavedRooms, userId: e2eUser.id },
  )
}
