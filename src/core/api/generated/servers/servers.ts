import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'

import type {
  DeleteApiServersByServerIdMembership200,
  DeleteApiServersByServerIdMembership400,
  DeleteApiServersByServerIdMembership401,
  DeleteApiServersByServerIdMembership403,
  DeleteApiServersByServerIdMembership404,
  DeleteApiServersByServerIdMembership409,
  DeleteApiServersByServerIdMembership422,
  DeleteApiServersByServerIdMembership500,
  GetApiServers200,
  GetApiServers400,
  GetApiServers401,
  GetApiServers403,
  GetApiServers404,
  GetApiServers409,
  GetApiServers422,
  GetApiServers500,
  GetApiServersByServerId200,
  GetApiServersByServerId400,
  GetApiServersByServerId401,
  GetApiServersByServerId403,
  GetApiServersByServerId404,
  GetApiServersByServerId409,
  GetApiServersByServerId422,
  GetApiServersByServerId500,
  GetApiServersCommunity200,
  GetApiServersCommunity400,
  GetApiServersCommunity401,
  GetApiServersCommunity403,
  GetApiServersCommunity404,
  GetApiServersCommunity409,
  GetApiServersCommunity422,
  GetApiServersCommunity500,
  PostApiServers200,
  PostApiServers400,
  PostApiServers401,
  PostApiServers403,
  PostApiServers404,
  PostApiServers409,
  PostApiServers422,
  PostApiServers500,
  PostApiServersBodyOne,
  PostApiServersBodyThree,
  PostApiServersBodyTwo,
  PostApiServersByServerIdJoin200,
  PostApiServersByServerIdJoin400,
  PostApiServersByServerIdJoin401,
  PostApiServersByServerIdJoin403,
  PostApiServersByServerIdJoin404,
  PostApiServersByServerIdJoin409,
  PostApiServersByServerIdJoin422,
  PostApiServersByServerIdJoin500,
} from '../model'

import { orvalMutator } from '../../http/orval-mutator.ts'
import type { ErrorType, BodyType } from '../../http/orval-mutator.ts'

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

export const getApiServers = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiServers200>({ url: `/api/servers/`, method: 'GET', signal }, options)
}

export const getGetApiServersQueryKey = () => {
  return [`/api/servers/`] as const
}

export const getGetApiServersQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiServers>>,
  TError = ErrorType<
    | GetApiServers400
    | GetApiServers401
    | GetApiServers403
    | GetApiServers404
    | GetApiServers409
    | GetApiServers422
    | GetApiServers500
  >,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiServers>>, TError, TData>>
  request?: SecondParameter<typeof orvalMutator>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiServersQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiServers>>> = ({ signal }) =>
    getApiServers(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiServers>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiServersQueryResult = NonNullable<Awaited<ReturnType<typeof getApiServers>>>
export type GetApiServersQueryError = ErrorType<
  | GetApiServers400
  | GetApiServers401
  | GetApiServers403
  | GetApiServers404
  | GetApiServers409
  | GetApiServers422
  | GetApiServers500
>

export function useGetApiServers<
  TData = Awaited<ReturnType<typeof getApiServers>>,
  TError = ErrorType<
    | GetApiServers400
    | GetApiServers401
    | GetApiServers403
    | GetApiServers404
    | GetApiServers409
    | GetApiServers422
    | GetApiServers500
  >,
>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiServers>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiServers>>,
          TError,
          Awaited<ReturnType<typeof getApiServers>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiServers<
  TData = Awaited<ReturnType<typeof getApiServers>>,
  TError = ErrorType<
    | GetApiServers400
    | GetApiServers401
    | GetApiServers403
    | GetApiServers404
    | GetApiServers409
    | GetApiServers422
    | GetApiServers500
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiServers>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiServers>>,
          TError,
          Awaited<ReturnType<typeof getApiServers>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiServers<
  TData = Awaited<ReturnType<typeof getApiServers>>,
  TError = ErrorType<
    | GetApiServers400
    | GetApiServers401
    | GetApiServers403
    | GetApiServers404
    | GetApiServers409
    | GetApiServers422
    | GetApiServers500
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiServers>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiServers<
  TData = Awaited<ReturnType<typeof getApiServers>>,
  TError = ErrorType<
    | GetApiServers400
    | GetApiServers401
    | GetApiServers403
    | GetApiServers404
    | GetApiServers409
    | GetApiServers422
    | GetApiServers500
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiServers>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiServersQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const postApiServers = (
  postApiServersBody:
    | BodyType<PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree>
    | PostApiServersBodyTwo
    | PostApiServersBodyThree,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiServers200>(
    { url: `/api/servers/`, method: 'POST', data: postApiServersBody, signal },
    options,
  )
}

export const getPostApiServersMutationOptions = <
  TError = ErrorType<
    | PostApiServers400
    | PostApiServers401
    | PostApiServers403
    | PostApiServers404
    | PostApiServers409
    | PostApiServers422
    | PostApiServers500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiServers>>,
    TError,
    { data: BodyType<PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree> },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiServers>>,
  TError,
  { data: BodyType<PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree> },
  TContext
> => {
  const mutationKey = ['postApiServers']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiServers>>,
    { data: BodyType<PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree> }
  > = (props) => {
    const { data } = props ?? {}

    return postApiServers(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiServersMutationResult = NonNullable<Awaited<ReturnType<typeof postApiServers>>>
export type PostApiServersMutationBody = BodyType<
  PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree
>
export type PostApiServersMutationError = ErrorType<
  | PostApiServers400
  | PostApiServers401
  | PostApiServers403
  | PostApiServers404
  | PostApiServers409
  | PostApiServers422
  | PostApiServers500
>

export const usePostApiServers = <
  TError = ErrorType<
    | PostApiServers400
    | PostApiServers401
    | PostApiServers403
    | PostApiServers404
    | PostApiServers409
    | PostApiServers422
    | PostApiServers500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiServers>>,
      TError,
      { data: BodyType<PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree> },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiServers>>,
  TError,
  { data: BodyType<PostApiServersBodyOne | PostApiServersBodyTwo | PostApiServersBodyThree> },
  TContext
> => {
  return useMutation(getPostApiServersMutationOptions(options), queryClient)
}
export const getApiServersCommunity = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiServersCommunity200>(
    { url: `/api/servers/community`, method: 'GET', signal },
    options,
  )
}

export const getGetApiServersCommunityQueryKey = () => {
  return [`/api/servers/community`] as const
}

export const getGetApiServersCommunityQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiServersCommunity>>,
  TError = ErrorType<
    | GetApiServersCommunity400
    | GetApiServersCommunity401
    | GetApiServersCommunity403
    | GetApiServersCommunity404
    | GetApiServersCommunity409
    | GetApiServersCommunity422
    | GetApiServersCommunity500
  >,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getApiServersCommunity>>, TError, TData>
  >
  request?: SecondParameter<typeof orvalMutator>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiServersCommunityQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiServersCommunity>>> = ({ signal }) =>
    getApiServersCommunity(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiServersCommunity>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiServersCommunityQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiServersCommunity>>
>
export type GetApiServersCommunityQueryError = ErrorType<
  | GetApiServersCommunity400
  | GetApiServersCommunity401
  | GetApiServersCommunity403
  | GetApiServersCommunity404
  | GetApiServersCommunity409
  | GetApiServersCommunity422
  | GetApiServersCommunity500
>

export function useGetApiServersCommunity<
  TData = Awaited<ReturnType<typeof getApiServersCommunity>>,
  TError = ErrorType<
    | GetApiServersCommunity400
    | GetApiServersCommunity401
    | GetApiServersCommunity403
    | GetApiServersCommunity404
    | GetApiServersCommunity409
    | GetApiServersCommunity422
    | GetApiServersCommunity500
  >,
>(
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersCommunity>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiServersCommunity>>,
          TError,
          Awaited<ReturnType<typeof getApiServersCommunity>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiServersCommunity<
  TData = Awaited<ReturnType<typeof getApiServersCommunity>>,
  TError = ErrorType<
    | GetApiServersCommunity400
    | GetApiServersCommunity401
    | GetApiServersCommunity403
    | GetApiServersCommunity404
    | GetApiServersCommunity409
    | GetApiServersCommunity422
    | GetApiServersCommunity500
  >,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersCommunity>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiServersCommunity>>,
          TError,
          Awaited<ReturnType<typeof getApiServersCommunity>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiServersCommunity<
  TData = Awaited<ReturnType<typeof getApiServersCommunity>>,
  TError = ErrorType<
    | GetApiServersCommunity400
    | GetApiServersCommunity401
    | GetApiServersCommunity403
    | GetApiServersCommunity404
    | GetApiServersCommunity409
    | GetApiServersCommunity422
    | GetApiServersCommunity500
  >,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersCommunity>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiServersCommunity<
  TData = Awaited<ReturnType<typeof getApiServersCommunity>>,
  TError = ErrorType<
    | GetApiServersCommunity400
    | GetApiServersCommunity401
    | GetApiServersCommunity403
    | GetApiServersCommunity404
    | GetApiServersCommunity409
    | GetApiServersCommunity422
    | GetApiServersCommunity500
  >,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersCommunity>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiServersCommunityQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const getApiServersByServerId = (
  serverId: string,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiServersByServerId200>(
    { url: `/api/servers/${serverId}`, method: 'GET', signal },
    options,
  )
}

export const getGetApiServersByServerIdQueryKey = (serverId: string) => {
  return [`/api/servers/${serverId}`] as const
}

export const getGetApiServersByServerIdQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiServersByServerId>>,
  TError = ErrorType<
    | GetApiServersByServerId400
    | GetApiServersByServerId401
    | GetApiServersByServerId403
    | GetApiServersByServerId404
    | GetApiServersByServerId409
    | GetApiServersByServerId422
    | GetApiServersByServerId500
  >,
>(
  serverId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersByServerId>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiServersByServerIdQueryKey(serverId)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiServersByServerId>>> = ({
    signal,
  }) => getApiServersByServerId(serverId, requestOptions, signal)

  return {
    queryKey,
    queryFn,
    enabled: serverId !== null && serverId !== undefined,
    ...queryOptions,
  } as UseQueryOptions<Awaited<ReturnType<typeof getApiServersByServerId>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }
}

export type GetApiServersByServerIdQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiServersByServerId>>
>
export type GetApiServersByServerIdQueryError = ErrorType<
  | GetApiServersByServerId400
  | GetApiServersByServerId401
  | GetApiServersByServerId403
  | GetApiServersByServerId404
  | GetApiServersByServerId409
  | GetApiServersByServerId422
  | GetApiServersByServerId500
>

export function useGetApiServersByServerId<
  TData = Awaited<ReturnType<typeof getApiServersByServerId>>,
  TError = ErrorType<
    | GetApiServersByServerId400
    | GetApiServersByServerId401
    | GetApiServersByServerId403
    | GetApiServersByServerId404
    | GetApiServersByServerId409
    | GetApiServersByServerId422
    | GetApiServersByServerId500
  >,
>(
  serverId: string,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersByServerId>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiServersByServerId>>,
          TError,
          Awaited<ReturnType<typeof getApiServersByServerId>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiServersByServerId<
  TData = Awaited<ReturnType<typeof getApiServersByServerId>>,
  TError = ErrorType<
    | GetApiServersByServerId400
    | GetApiServersByServerId401
    | GetApiServersByServerId403
    | GetApiServersByServerId404
    | GetApiServersByServerId409
    | GetApiServersByServerId422
    | GetApiServersByServerId500
  >,
>(
  serverId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersByServerId>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiServersByServerId>>,
          TError,
          Awaited<ReturnType<typeof getApiServersByServerId>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiServersByServerId<
  TData = Awaited<ReturnType<typeof getApiServersByServerId>>,
  TError = ErrorType<
    | GetApiServersByServerId400
    | GetApiServersByServerId401
    | GetApiServersByServerId403
    | GetApiServersByServerId404
    | GetApiServersByServerId409
    | GetApiServersByServerId422
    | GetApiServersByServerId500
  >,
>(
  serverId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersByServerId>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiServersByServerId<
  TData = Awaited<ReturnType<typeof getApiServersByServerId>>,
  TError = ErrorType<
    | GetApiServersByServerId400
    | GetApiServersByServerId401
    | GetApiServersByServerId403
    | GetApiServersByServerId404
    | GetApiServersByServerId409
    | GetApiServersByServerId422
    | GetApiServersByServerId500
  >,
>(
  serverId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiServersByServerId>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiServersByServerIdQueryOptions(serverId, options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const postApiServersByServerIdJoin = (
  serverId: string,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiServersByServerIdJoin200>(
    { url: `/api/servers/${serverId}/join`, method: 'POST', signal },
    options,
  )
}

export const getPostApiServersByServerIdJoinMutationOptions = <
  TError = ErrorType<
    | PostApiServersByServerIdJoin400
    | PostApiServersByServerIdJoin401
    | PostApiServersByServerIdJoin403
    | PostApiServersByServerIdJoin404
    | PostApiServersByServerIdJoin409
    | PostApiServersByServerIdJoin422
    | PostApiServersByServerIdJoin500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiServersByServerIdJoin>>,
    TError,
    { serverId: string },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiServersByServerIdJoin>>,
  TError,
  { serverId: string },
  TContext
> => {
  const mutationKey = ['postApiServersByServerIdJoin']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiServersByServerIdJoin>>,
    { serverId: string }
  > = (props) => {
    const { serverId } = props ?? {}

    return postApiServersByServerIdJoin(serverId, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiServersByServerIdJoinMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiServersByServerIdJoin>>
>

export type PostApiServersByServerIdJoinMutationError = ErrorType<
  | PostApiServersByServerIdJoin400
  | PostApiServersByServerIdJoin401
  | PostApiServersByServerIdJoin403
  | PostApiServersByServerIdJoin404
  | PostApiServersByServerIdJoin409
  | PostApiServersByServerIdJoin422
  | PostApiServersByServerIdJoin500
>

export const usePostApiServersByServerIdJoin = <
  TError = ErrorType<
    | PostApiServersByServerIdJoin400
    | PostApiServersByServerIdJoin401
    | PostApiServersByServerIdJoin403
    | PostApiServersByServerIdJoin404
    | PostApiServersByServerIdJoin409
    | PostApiServersByServerIdJoin422
    | PostApiServersByServerIdJoin500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiServersByServerIdJoin>>,
      TError,
      { serverId: string },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiServersByServerIdJoin>>,
  TError,
  { serverId: string },
  TContext
> => {
  return useMutation(getPostApiServersByServerIdJoinMutationOptions(options), queryClient)
}
export const deleteApiServersByServerIdMembership = (
  serverId: string,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<DeleteApiServersByServerIdMembership200>(
    { url: `/api/servers/${serverId}/membership`, method: 'DELETE', signal },
    options,
  )
}

export const getDeleteApiServersByServerIdMembershipMutationOptions = <
  TError = ErrorType<
    | DeleteApiServersByServerIdMembership400
    | DeleteApiServersByServerIdMembership401
    | DeleteApiServersByServerIdMembership403
    | DeleteApiServersByServerIdMembership404
    | DeleteApiServersByServerIdMembership409
    | DeleteApiServersByServerIdMembership422
    | DeleteApiServersByServerIdMembership500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteApiServersByServerIdMembership>>,
    TError,
    { serverId: string },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof deleteApiServersByServerIdMembership>>,
  TError,
  { serverId: string },
  TContext
> => {
  const mutationKey = ['deleteApiServersByServerIdMembership']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deleteApiServersByServerIdMembership>>,
    { serverId: string }
  > = (props) => {
    const { serverId } = props ?? {}

    return deleteApiServersByServerIdMembership(serverId, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type DeleteApiServersByServerIdMembershipMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteApiServersByServerIdMembership>>
>

export type DeleteApiServersByServerIdMembershipMutationError = ErrorType<
  | DeleteApiServersByServerIdMembership400
  | DeleteApiServersByServerIdMembership401
  | DeleteApiServersByServerIdMembership403
  | DeleteApiServersByServerIdMembership404
  | DeleteApiServersByServerIdMembership409
  | DeleteApiServersByServerIdMembership422
  | DeleteApiServersByServerIdMembership500
>

export const useDeleteApiServersByServerIdMembership = <
  TError = ErrorType<
    | DeleteApiServersByServerIdMembership400
    | DeleteApiServersByServerIdMembership401
    | DeleteApiServersByServerIdMembership403
    | DeleteApiServersByServerIdMembership404
    | DeleteApiServersByServerIdMembership409
    | DeleteApiServersByServerIdMembership422
    | DeleteApiServersByServerIdMembership500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof deleteApiServersByServerIdMembership>>,
      TError,
      { serverId: string },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof deleteApiServersByServerIdMembership>>,
  TError,
  { serverId: string },
  TContext
> => {
  return useMutation(getDeleteApiServersByServerIdMembershipMutationOptions(options), queryClient)
}
