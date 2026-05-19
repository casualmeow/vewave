import { AxiosError } from 'axios'

type ApiErrorBody = {
  error?: {
    message?: string
  }
  message?: string
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
