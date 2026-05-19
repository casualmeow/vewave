import { httpClient } from './client'
import type { AxiosError, AxiosRequestConfig } from 'axios'

export const orvalMutator = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const response = await httpClient.request<T>({
    ...config,
    ...options,
    headers: {
      ...config.headers,
      ...options?.headers,
    },
  })

  return response.data
}

export type ErrorType<TError> = AxiosError<TError>
export type BodyType<TBodyData> = TBodyData
