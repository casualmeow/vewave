import { useQuery } from '@tanstack/react-query'
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'

import type { GetApiHealth200, GetApiHealthDb200, GetApiHealthDb503 } from '../model'

import { orvalMutator } from '../../http/orval-mutator.ts'
import type { ErrorType } from '../../http/orval-mutator.ts'

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1]

const withQueryKey = <T extends object, K>(query: T, queryKey: K): T & { queryKey: K } => {
  const result = { queryKey } as T & { queryKey: K }
  for (const key of Object.keys(query)) {
    if (key === 'queryKey') continue
    Object.defineProperty(result, key, {
      enumerable: true,
      configurable: true,
      get: () => (query as Record<string, unknown>)[key],
    })
  }
  return result
}

export const getApiHealth = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiHealth200>({ url: `/api/health`, method: 'GET', signal }, options)
}

export const getGetApiHealthQueryKey = () => {
  return [`/api/health`] as const
}

export const getGetApiHealthQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiHealth>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealth>>, TError, TData>>
  request?: SecondParameter<typeof orvalMutator>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiHealthQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiHealth>>> = ({ signal }) =>
    getApiHealth(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiHealth>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiHealthQueryResult = NonNullable<Awaited<ReturnType<typeof getApiHealth>>>
export type GetApiHealthQueryError = ErrorType<unknown>

export function useGetApiHealth<
  TData = Awaited<ReturnType<typeof getApiHealth>>,
  TError = ErrorType<unknown>,
>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealth>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiHealth>>,
          TError,
          Awaited<ReturnType<typeof getApiHealth>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiHealth<
  TData = Awaited<ReturnType<typeof getApiHealth>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealth>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiHealth>>,
          TError,
          Awaited<ReturnType<typeof getApiHealth>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiHealth<
  TData = Awaited<ReturnType<typeof getApiHealth>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealth>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiHealth<
  TData = Awaited<ReturnType<typeof getApiHealth>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealth>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiHealthQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const getApiHealthDb = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiHealthDb200>({ url: `/api/health/db`, method: 'GET', signal }, options)
}

export const getGetApiHealthDbQueryKey = () => {
  return [`/api/health/db`] as const
}

export const getGetApiHealthDbQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiHealthDb>>,
  TError = ErrorType<GetApiHealthDb503>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealthDb>>, TError, TData>>
  request?: SecondParameter<typeof orvalMutator>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiHealthDbQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiHealthDb>>> = ({ signal }) =>
    getApiHealthDb(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiHealthDb>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiHealthDbQueryResult = NonNullable<Awaited<ReturnType<typeof getApiHealthDb>>>
export type GetApiHealthDbQueryError = ErrorType<GetApiHealthDb503>

export function useGetApiHealthDb<
  TData = Awaited<ReturnType<typeof getApiHealthDb>>,
  TError = ErrorType<GetApiHealthDb503>,
>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealthDb>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiHealthDb>>,
          TError,
          Awaited<ReturnType<typeof getApiHealthDb>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiHealthDb<
  TData = Awaited<ReturnType<typeof getApiHealthDb>>,
  TError = ErrorType<GetApiHealthDb503>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealthDb>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiHealthDb>>,
          TError,
          Awaited<ReturnType<typeof getApiHealthDb>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiHealthDb<
  TData = Awaited<ReturnType<typeof getApiHealthDb>>,
  TError = ErrorType<GetApiHealthDb503>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealthDb>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiHealthDb<
  TData = Awaited<ReturnType<typeof getApiHealthDb>>,
  TError = ErrorType<GetApiHealthDb503>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiHealthDb>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiHealthDbQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}
