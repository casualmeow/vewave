import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { refreshSessionOnce } from './refresh-session'
import { useAuthStore } from '@/modules/auth/model'
import { apiUrl } from '@/shared/config'

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const httpClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 8000,
})

httpClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const requestUrl = originalRequest?.url ?? ''
    const isAuthEndpoint = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/passkey',
      '/api/auth/refresh',
      '/api/auth/register',
    ].some((endpoint) => requestUrl.includes(endpoint))

    const accessToken = useAuthStore.getState().accessToken

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint ||
      !accessToken
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const refreshedAccessToken = await refreshSessionOnce()
      useAuthStore.getState().setAccessToken(refreshedAccessToken)
      originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`

      return httpClient(originalRequest)
    } catch (refreshError) {
      useAuthStore.getState().setAnonymous()
      return Promise.reject(refreshError)
    }
  },
)
