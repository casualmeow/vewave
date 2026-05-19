import axios from 'axios'
import type { RefreshResponse } from '@/modules/auth/model'
import { apiUrl } from '@/shared/config'

const refreshClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
})

let refreshPromise: Promise<string> | null = null

export async function refreshSession() {
  const response = await refreshClient.post<RefreshResponse>('/api/auth/refresh')
  return response.data.accessToken
}

export function refreshSessionOnce() {
  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}
