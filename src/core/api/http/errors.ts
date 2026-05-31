import { AxiosError } from 'axios'
import { apiUrl } from '@/shared/config'

type ApiErrorBody = {
  error?: {
    message?: string
  }
  message?: string
}

export type ApiErrorDescription = {
  title: string
  message: string
  status?: number
  code?: string
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined
    return data?.error?.message ?? data?.message ?? error.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function describeApiError(error: unknown, fallback = 'Something went wrong.') {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const code = error.code
    const data = error.response?.data as ApiErrorBody | undefined
    const serverMessage = data?.error?.message ?? data?.message

    if (status) {
      return {
        title: `HTTP ${status}`,
        message: serverMessage ?? error.message ?? fallback,
        status,
        code,
      } satisfies ApiErrorDescription
    }

    if (code === AxiosError.ETIMEDOUT || code === AxiosError.ECONNABORTED) {
      return {
        title: 'API request timed out',
        message: `No response from ${apiUrl}. Check that the backend is running and that the endpoint is not hanging.`,
        code,
      } satisfies ApiErrorDescription
    }

    if (code === AxiosError.ERR_NETWORK || error.message === 'Network Error') {
      return {
        title: 'Network or CORS error',
        message: `The browser could not read a response from ${apiUrl}. If the backend is running, check CORS origin, credentials=true, and Access-Control-Allow-Credentials headers.`,
        code,
      } satisfies ApiErrorDescription
    }

    return {
      title: 'API request failed',
      message: serverMessage ?? error.message ?? fallback,
      code,
    } satisfies ApiErrorDescription
  }

  if (error instanceof Error) {
    return {
      title: 'Client error',
      message: error.message,
    } satisfies ApiErrorDescription
  }

  return {
    title: 'Unknown error',
    message: fallback,
  } satisfies ApiErrorDescription
}
