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
  GetApiProfileByUsername200,
  GetApiProfileByUsername400,
  GetApiProfileByUsername401,
  GetApiProfileByUsername404,
  GetApiProfileByUsername409,
  GetApiProfileByUsername500,
  GetApiProfileMe200,
  GetApiProfileMe400,
  GetApiProfileMe401,
  GetApiProfileMe404,
  GetApiProfileMe409,
  GetApiProfileMe500,
  PatchApiProfileMe200,
  PatchApiProfileMe400,
  PatchApiProfileMe401,
  PatchApiProfileMe404,
  PatchApiProfileMe409,
  PatchApiProfileMe500,
  PatchApiProfileMeBodyOne,
  PatchApiProfileMeBodyThree,
  PatchApiProfileMeBodyTwo,
  PatchApiProfileMePassword200,
  PatchApiProfileMePassword400,
  PatchApiProfileMePassword401,
  PatchApiProfileMePassword404,
  PatchApiProfileMePassword409,
  PatchApiProfileMePassword500,
  PatchApiProfileMePasswordBodyOne,
  PatchApiProfileMePasswordBodyThree,
  PatchApiProfileMePasswordBodyTwo,
  PatchApiProfileMeRoomGuide200,
  PatchApiProfileMeRoomGuide400,
  PatchApiProfileMeRoomGuide401,
  PatchApiProfileMeRoomGuide404,
  PatchApiProfileMeRoomGuide409,
  PatchApiProfileMeRoomGuide500,
  PatchApiProfileMeRoomGuideBodyOne,
  PatchApiProfileMeRoomGuideBodyThree,
  PatchApiProfileMeRoomGuideBodyTwo,
  PostApiProfileMeAvatar200,
  PostApiProfileMeAvatar400,
  PostApiProfileMeAvatar401,
  PostApiProfileMeAvatar404,
  PostApiProfileMeAvatar409,
  PostApiProfileMeAvatar500,
  PostApiProfileMeAvatarBodyOne,
  PostApiProfileMeAvatarBodyThree,
  PostApiProfileMeAvatarBodyTwo,
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

export const getApiProfileMe = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiProfileMe200>(
    { url: `/api/profile/me`, method: 'GET', signal },
    options,
  )
}

export const getGetApiProfileMeQueryKey = () => {
  return [`/api/profile/me`] as const
}

export const getGetApiProfileMeQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiProfileMe>>,
  TError = ErrorType<
    | GetApiProfileMe400
    | GetApiProfileMe401
    | GetApiProfileMe404
    | GetApiProfileMe409
    | GetApiProfileMe500
  >,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiProfileMe>>, TError, TData>>
  request?: SecondParameter<typeof orvalMutator>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiProfileMeQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiProfileMe>>> = ({ signal }) =>
    getApiProfileMe(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiProfileMe>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiProfileMeQueryResult = NonNullable<Awaited<ReturnType<typeof getApiProfileMe>>>
export type GetApiProfileMeQueryError = ErrorType<
  | GetApiProfileMe400
  | GetApiProfileMe401
  | GetApiProfileMe404
  | GetApiProfileMe409
  | GetApiProfileMe500
>

export function useGetApiProfileMe<
  TData = Awaited<ReturnType<typeof getApiProfileMe>>,
  TError = ErrorType<
    | GetApiProfileMe400
    | GetApiProfileMe401
    | GetApiProfileMe404
    | GetApiProfileMe409
    | GetApiProfileMe500
  >,
>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiProfileMe>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiProfileMe>>,
          TError,
          Awaited<ReturnType<typeof getApiProfileMe>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiProfileMe<
  TData = Awaited<ReturnType<typeof getApiProfileMe>>,
  TError = ErrorType<
    | GetApiProfileMe400
    | GetApiProfileMe401
    | GetApiProfileMe404
    | GetApiProfileMe409
    | GetApiProfileMe500
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiProfileMe>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiProfileMe>>,
          TError,
          Awaited<ReturnType<typeof getApiProfileMe>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiProfileMe<
  TData = Awaited<ReturnType<typeof getApiProfileMe>>,
  TError = ErrorType<
    | GetApiProfileMe400
    | GetApiProfileMe401
    | GetApiProfileMe404
    | GetApiProfileMe409
    | GetApiProfileMe500
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiProfileMe>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiProfileMe<
  TData = Awaited<ReturnType<typeof getApiProfileMe>>,
  TError = ErrorType<
    | GetApiProfileMe400
    | GetApiProfileMe401
    | GetApiProfileMe404
    | GetApiProfileMe409
    | GetApiProfileMe500
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiProfileMe>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiProfileMeQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const patchApiProfileMe = (
  patchApiProfileMeBody: BodyType<
    PatchApiProfileMeBodyOne | PatchApiProfileMeBodyTwo | PatchApiProfileMeBodyThree
  >,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PatchApiProfileMe200>(
    { url: `/api/profile/me`, method: 'PATCH', data: patchApiProfileMeBody, signal },
    options,
  )
}

export const getPatchApiProfileMeMutationKey = () => ['patchApiProfileMe'] as const

export const getPatchApiProfileMeMutationOptions = <
  TError = ErrorType<
    | PatchApiProfileMe400
    | PatchApiProfileMe401
    | PatchApiProfileMe404
    | PatchApiProfileMe409
    | PatchApiProfileMe500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof patchApiProfileMe>>,
    TError,
    PatchApiProfileMeMutationVariables,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof patchApiProfileMe>>,
  TError,
  PatchApiProfileMeMutationVariables,
  TContext
> => {
  const mutationKey = getPatchApiProfileMeMutationKey()
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof patchApiProfileMe>>,
    PatchApiProfileMeMutationVariables
  > = (props) => {
    const { data } = props ?? {}

    return patchApiProfileMe(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PatchApiProfileMeMutationResult = NonNullable<
  Awaited<ReturnType<typeof patchApiProfileMe>>
>
export type PatchApiProfileMeMutationBody = BodyType<
  PatchApiProfileMeBodyOne | PatchApiProfileMeBodyTwo | PatchApiProfileMeBodyThree
>
export type PatchApiProfileMeMutationError = ErrorType<
  | PatchApiProfileMe400
  | PatchApiProfileMe401
  | PatchApiProfileMe404
  | PatchApiProfileMe409
  | PatchApiProfileMe500
>
export type PatchApiProfileMeMutationVariables = {
  data: BodyType<PatchApiProfileMeBodyOne | PatchApiProfileMeBodyTwo | PatchApiProfileMeBodyThree>
}

export const usePatchApiProfileMe = <
  TError = ErrorType<
    | PatchApiProfileMe400
    | PatchApiProfileMe401
    | PatchApiProfileMe404
    | PatchApiProfileMe409
    | PatchApiProfileMe500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof patchApiProfileMe>>,
      TError,
      PatchApiProfileMeMutationVariables,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof patchApiProfileMe>>,
  TError,
  PatchApiProfileMeMutationVariables,
  TContext
> => {
  return useMutation(getPatchApiProfileMeMutationOptions(options), queryClient)
}
export const patchApiProfileMeRoomGuide = (
  patchApiProfileMeRoomGuideBody: BodyType<
    | PatchApiProfileMeRoomGuideBodyOne
    | PatchApiProfileMeRoomGuideBodyTwo
    | PatchApiProfileMeRoomGuideBodyThree
  >,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PatchApiProfileMeRoomGuide200>(
    {
      url: `/api/profile/me/room-guide`,
      method: 'PATCH',
      data: patchApiProfileMeRoomGuideBody,
      signal,
    },
    options,
  )
}

export const getPatchApiProfileMeRoomGuideMutationKey = () =>
  ['patchApiProfileMeRoomGuide'] as const

export const getPatchApiProfileMeRoomGuideMutationOptions = <
  TError = ErrorType<
    | PatchApiProfileMeRoomGuide400
    | PatchApiProfileMeRoomGuide401
    | PatchApiProfileMeRoomGuide404
    | PatchApiProfileMeRoomGuide409
    | PatchApiProfileMeRoomGuide500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof patchApiProfileMeRoomGuide>>,
    TError,
    PatchApiProfileMeRoomGuideMutationVariables,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof patchApiProfileMeRoomGuide>>,
  TError,
  PatchApiProfileMeRoomGuideMutationVariables,
  TContext
> => {
  const mutationKey = getPatchApiProfileMeRoomGuideMutationKey()
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof patchApiProfileMeRoomGuide>>,
    PatchApiProfileMeRoomGuideMutationVariables
  > = (props) => {
    const { data } = props ?? {}

    return patchApiProfileMeRoomGuide(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PatchApiProfileMeRoomGuideMutationResult = NonNullable<
  Awaited<ReturnType<typeof patchApiProfileMeRoomGuide>>
>
export type PatchApiProfileMeRoomGuideMutationBody = BodyType<
  | PatchApiProfileMeRoomGuideBodyOne
  | PatchApiProfileMeRoomGuideBodyTwo
  | PatchApiProfileMeRoomGuideBodyThree
>
export type PatchApiProfileMeRoomGuideMutationError = ErrorType<
  | PatchApiProfileMeRoomGuide400
  | PatchApiProfileMeRoomGuide401
  | PatchApiProfileMeRoomGuide404
  | PatchApiProfileMeRoomGuide409
  | PatchApiProfileMeRoomGuide500
>
export type PatchApiProfileMeRoomGuideMutationVariables = {
  data: BodyType<
    | PatchApiProfileMeRoomGuideBodyOne
    | PatchApiProfileMeRoomGuideBodyTwo
    | PatchApiProfileMeRoomGuideBodyThree
  >
}

export const usePatchApiProfileMeRoomGuide = <
  TError = ErrorType<
    | PatchApiProfileMeRoomGuide400
    | PatchApiProfileMeRoomGuide401
    | PatchApiProfileMeRoomGuide404
    | PatchApiProfileMeRoomGuide409
    | PatchApiProfileMeRoomGuide500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof patchApiProfileMeRoomGuide>>,
      TError,
      PatchApiProfileMeRoomGuideMutationVariables,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof patchApiProfileMeRoomGuide>>,
  TError,
  PatchApiProfileMeRoomGuideMutationVariables,
  TContext
> => {
  return useMutation(getPatchApiProfileMeRoomGuideMutationOptions(options), queryClient)
}
export const postApiProfileMeAvatar = (
  postApiProfileMeAvatarBody: BodyType<
    PostApiProfileMeAvatarBodyOne | PostApiProfileMeAvatarBodyTwo | PostApiProfileMeAvatarBodyThree
  >,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiProfileMeAvatar200>(
    { url: `/api/profile/me/avatar`, method: 'POST', data: postApiProfileMeAvatarBody, signal },
    options,
  )
}

export const getPostApiProfileMeAvatarMutationKey = () => ['postApiProfileMeAvatar'] as const

export const getPostApiProfileMeAvatarMutationOptions = <
  TError = ErrorType<
    | PostApiProfileMeAvatar400
    | PostApiProfileMeAvatar401
    | PostApiProfileMeAvatar404
    | PostApiProfileMeAvatar409
    | PostApiProfileMeAvatar500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiProfileMeAvatar>>,
    TError,
    PostApiProfileMeAvatarMutationVariables,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiProfileMeAvatar>>,
  TError,
  PostApiProfileMeAvatarMutationVariables,
  TContext
> => {
  const mutationKey = getPostApiProfileMeAvatarMutationKey()
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiProfileMeAvatar>>,
    PostApiProfileMeAvatarMutationVariables
  > = (props) => {
    const { data } = props ?? {}

    return postApiProfileMeAvatar(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiProfileMeAvatarMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiProfileMeAvatar>>
>
export type PostApiProfileMeAvatarMutationBody = BodyType<
  PostApiProfileMeAvatarBodyOne | PostApiProfileMeAvatarBodyTwo | PostApiProfileMeAvatarBodyThree
>
export type PostApiProfileMeAvatarMutationError = ErrorType<
  | PostApiProfileMeAvatar400
  | PostApiProfileMeAvatar401
  | PostApiProfileMeAvatar404
  | PostApiProfileMeAvatar409
  | PostApiProfileMeAvatar500
>
export type PostApiProfileMeAvatarMutationVariables = {
  data: BodyType<
    PostApiProfileMeAvatarBodyOne | PostApiProfileMeAvatarBodyTwo | PostApiProfileMeAvatarBodyThree
  >
}

export const usePostApiProfileMeAvatar = <
  TError = ErrorType<
    | PostApiProfileMeAvatar400
    | PostApiProfileMeAvatar401
    | PostApiProfileMeAvatar404
    | PostApiProfileMeAvatar409
    | PostApiProfileMeAvatar500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiProfileMeAvatar>>,
      TError,
      PostApiProfileMeAvatarMutationVariables,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiProfileMeAvatar>>,
  TError,
  PostApiProfileMeAvatarMutationVariables,
  TContext
> => {
  return useMutation(getPostApiProfileMeAvatarMutationOptions(options), queryClient)
}
export const patchApiProfileMePassword = (
  patchApiProfileMePasswordBody: BodyType<
    | PatchApiProfileMePasswordBodyOne
    | PatchApiProfileMePasswordBodyTwo
    | PatchApiProfileMePasswordBodyThree
  >,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PatchApiProfileMePassword200>(
    {
      url: `/api/profile/me/password`,
      method: 'PATCH',
      data: patchApiProfileMePasswordBody,
      signal,
    },
    options,
  )
}

export const getPatchApiProfileMePasswordMutationKey = () => ['patchApiProfileMePassword'] as const

export const getPatchApiProfileMePasswordMutationOptions = <
  TError = ErrorType<
    | PatchApiProfileMePassword400
    | PatchApiProfileMePassword401
    | PatchApiProfileMePassword404
    | PatchApiProfileMePassword409
    | PatchApiProfileMePassword500
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof patchApiProfileMePassword>>,
    TError,
    PatchApiProfileMePasswordMutationVariables,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof patchApiProfileMePassword>>,
  TError,
  PatchApiProfileMePasswordMutationVariables,
  TContext
> => {
  const mutationKey = getPatchApiProfileMePasswordMutationKey()
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof patchApiProfileMePassword>>,
    PatchApiProfileMePasswordMutationVariables
  > = (props) => {
    const { data } = props ?? {}

    return patchApiProfileMePassword(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PatchApiProfileMePasswordMutationResult = NonNullable<
  Awaited<ReturnType<typeof patchApiProfileMePassword>>
>
export type PatchApiProfileMePasswordMutationBody = BodyType<
  | PatchApiProfileMePasswordBodyOne
  | PatchApiProfileMePasswordBodyTwo
  | PatchApiProfileMePasswordBodyThree
>
export type PatchApiProfileMePasswordMutationError = ErrorType<
  | PatchApiProfileMePassword400
  | PatchApiProfileMePassword401
  | PatchApiProfileMePassword404
  | PatchApiProfileMePassword409
  | PatchApiProfileMePassword500
>
export type PatchApiProfileMePasswordMutationVariables = {
  data: BodyType<
    | PatchApiProfileMePasswordBodyOne
    | PatchApiProfileMePasswordBodyTwo
    | PatchApiProfileMePasswordBodyThree
  >
}

export const usePatchApiProfileMePassword = <
  TError = ErrorType<
    | PatchApiProfileMePassword400
    | PatchApiProfileMePassword401
    | PatchApiProfileMePassword404
    | PatchApiProfileMePassword409
    | PatchApiProfileMePassword500
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof patchApiProfileMePassword>>,
      TError,
      PatchApiProfileMePasswordMutationVariables,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof patchApiProfileMePassword>>,
  TError,
  PatchApiProfileMePasswordMutationVariables,
  TContext
> => {
  return useMutation(getPatchApiProfileMePasswordMutationOptions(options), queryClient)
}
export const getApiProfileByUsername = (
  username: string,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiProfileByUsername200>(
    { url: `/api/profile/${username}`, method: 'GET', signal },
    options,
  )
}

export const getGetApiProfileByUsernameQueryKey = (username: string) => {
  return [`/api/profile/${username}`] as const
}

export const getGetApiProfileByUsernameQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiProfileByUsername>>,
  TError = ErrorType<
    | GetApiProfileByUsername400
    | GetApiProfileByUsername401
    | GetApiProfileByUsername404
    | GetApiProfileByUsername409
    | GetApiProfileByUsername500
  >,
>(
  username: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiProfileByUsername>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiProfileByUsernameQueryKey(username)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiProfileByUsername>>> = ({
    signal,
  }) => getApiProfileByUsername(username, requestOptions, signal)

  return {
    queryKey,
    queryFn,
    enabled: username !== null && username !== undefined,
    ...queryOptions,
  } as UseQueryOptions<Awaited<ReturnType<typeof getApiProfileByUsername>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }
}

export type GetApiProfileByUsernameQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiProfileByUsername>>
>
export type GetApiProfileByUsernameQueryError = ErrorType<
  | GetApiProfileByUsername400
  | GetApiProfileByUsername401
  | GetApiProfileByUsername404
  | GetApiProfileByUsername409
  | GetApiProfileByUsername500
>

export function useGetApiProfileByUsername<
  TData = Awaited<ReturnType<typeof getApiProfileByUsername>>,
  TError = ErrorType<
    | GetApiProfileByUsername400
    | GetApiProfileByUsername401
    | GetApiProfileByUsername404
    | GetApiProfileByUsername409
    | GetApiProfileByUsername500
  >,
>(
  username: string,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiProfileByUsername>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiProfileByUsername>>,
          TError,
          Awaited<ReturnType<typeof getApiProfileByUsername>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiProfileByUsername<
  TData = Awaited<ReturnType<typeof getApiProfileByUsername>>,
  TError = ErrorType<
    | GetApiProfileByUsername400
    | GetApiProfileByUsername401
    | GetApiProfileByUsername404
    | GetApiProfileByUsername409
    | GetApiProfileByUsername500
  >,
>(
  username: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiProfileByUsername>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiProfileByUsername>>,
          TError,
          Awaited<ReturnType<typeof getApiProfileByUsername>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiProfileByUsername<
  TData = Awaited<ReturnType<typeof getApiProfileByUsername>>,
  TError = ErrorType<
    | GetApiProfileByUsername400
    | GetApiProfileByUsername401
    | GetApiProfileByUsername404
    | GetApiProfileByUsername409
    | GetApiProfileByUsername500
  >,
>(
  username: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiProfileByUsername>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiProfileByUsername<
  TData = Awaited<ReturnType<typeof getApiProfileByUsername>>,
  TError = ErrorType<
    | GetApiProfileByUsername400
    | GetApiProfileByUsername401
    | GetApiProfileByUsername404
    | GetApiProfileByUsername409
    | GetApiProfileByUsername500
  >,
>(
  username: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiProfileByUsername>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiProfileByUsernameQueryOptions(username, options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}
