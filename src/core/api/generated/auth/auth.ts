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
  GetApiAuthMe200,
  GetApiAuthMe400,
  GetApiAuthMe401,
  GetApiAuthMe409,
  GetApiAuthMe500,
  GetApiAuthMe503,
  GetApiAuthOauthByProviderCallbackParams,
  GetApiAuthOauthByProviderStartParams,
  PostApiAuthLogin200,
  PostApiAuthLogin400,
  PostApiAuthLogin401,
  PostApiAuthLogin409,
  PostApiAuthLogin500,
  PostApiAuthLogin503,
  PostApiAuthLoginBodyOne,
  PostApiAuthLoginBodyThree,
  PostApiAuthLoginBodyTwo,
  PostApiAuthLogout200,
  PostApiAuthLogout400,
  PostApiAuthLogout401,
  PostApiAuthLogout409,
  PostApiAuthLogout500,
  PostApiAuthLogout503,
  PostApiAuthPasskeyAuthenticationOptions200,
  PostApiAuthPasskeyAuthenticationOptions400,
  PostApiAuthPasskeyAuthenticationOptions401,
  PostApiAuthPasskeyAuthenticationOptions409,
  PostApiAuthPasskeyAuthenticationOptions500,
  PostApiAuthPasskeyAuthenticationOptions503,
  PostApiAuthPasskeyAuthenticationVerify200,
  PostApiAuthPasskeyAuthenticationVerify400,
  PostApiAuthPasskeyAuthenticationVerify401,
  PostApiAuthPasskeyAuthenticationVerify409,
  PostApiAuthPasskeyAuthenticationVerify500,
  PostApiAuthPasskeyAuthenticationVerify503,
  PostApiAuthPasskeyAuthenticationVerifyBodyOne,
  PostApiAuthPasskeyAuthenticationVerifyBodyThree,
  PostApiAuthPasskeyAuthenticationVerifyBodyTwo,
  PostApiAuthPasskeyRegisterOptions200,
  PostApiAuthPasskeyRegisterOptions400,
  PostApiAuthPasskeyRegisterOptions401,
  PostApiAuthPasskeyRegisterOptions409,
  PostApiAuthPasskeyRegisterOptions500,
  PostApiAuthPasskeyRegisterOptions503,
  PostApiAuthPasskeyRegisterOptionsBodyOne,
  PostApiAuthPasskeyRegisterOptionsBodyThree,
  PostApiAuthPasskeyRegisterOptionsBodyTwo,
  PostApiAuthPasskeyRegisterVerify200,
  PostApiAuthPasskeyRegisterVerify400,
  PostApiAuthPasskeyRegisterVerify401,
  PostApiAuthPasskeyRegisterVerify409,
  PostApiAuthPasskeyRegisterVerify500,
  PostApiAuthPasskeyRegisterVerify503,
  PostApiAuthPasskeyRegisterVerifyBodyOne,
  PostApiAuthPasskeyRegisterVerifyBodyThree,
  PostApiAuthPasskeyRegisterVerifyBodyTwo,
  PostApiAuthRefresh200,
  PostApiAuthRefresh400,
  PostApiAuthRefresh401,
  PostApiAuthRefresh409,
  PostApiAuthRefresh500,
  PostApiAuthRefresh503,
  PostApiAuthRegister200,
  PostApiAuthRegister400,
  PostApiAuthRegister401,
  PostApiAuthRegister409,
  PostApiAuthRegister500,
  PostApiAuthRegister503,
  PostApiAuthRegisterBodyOne,
  PostApiAuthRegisterBodyThree,
  PostApiAuthRegisterBodyTwo,
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

export const postApiAuthRegister = (
  postApiAuthRegisterBody:
    | BodyType<
        PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
      >
    | PostApiAuthRegisterBodyTwo
    | PostApiAuthRegisterBodyThree,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthRegister200>(
    { url: `/api/auth/register`, method: 'POST', data: postApiAuthRegisterBody, signal },
    options,
  )
}

export const getPostApiAuthRegisterMutationOptions = <
  TError = ErrorType<
    | PostApiAuthRegister400
    | PostApiAuthRegister401
    | PostApiAuthRegister409
    | PostApiAuthRegister500
    | PostApiAuthRegister503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthRegister>>,
    TError,
    {
      data: BodyType<
        PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
      >
    },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiAuthRegister>>,
  TError,
  {
    data: BodyType<
      PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
    >
  },
  TContext
> => {
  const mutationKey = ['postApiAuthRegister']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiAuthRegister>>,
    {
      data: BodyType<
        PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
      >
    }
  > = (props) => {
    const { data } = props ?? {}

    return postApiAuthRegister(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthRegisterMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthRegister>>
>
export type PostApiAuthRegisterMutationBody = BodyType<
  PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
>
export type PostApiAuthRegisterMutationError = ErrorType<
  | PostApiAuthRegister400
  | PostApiAuthRegister401
  | PostApiAuthRegister409
  | PostApiAuthRegister500
  | PostApiAuthRegister503
>

export const usePostApiAuthRegister = <
  TError = ErrorType<
    | PostApiAuthRegister400
    | PostApiAuthRegister401
    | PostApiAuthRegister409
    | PostApiAuthRegister500
    | PostApiAuthRegister503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthRegister>>,
      TError,
      {
        data: BodyType<
          PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
        >
      },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiAuthRegister>>,
  TError,
  {
    data: BodyType<
      PostApiAuthRegisterBodyOne | PostApiAuthRegisterBodyTwo | PostApiAuthRegisterBodyThree
    >
  },
  TContext
> => {
  return useMutation(getPostApiAuthRegisterMutationOptions(options), queryClient)
}
export const postApiAuthLogin = (
  postApiAuthLoginBody:
    | BodyType<PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree>
    | PostApiAuthLoginBodyTwo
    | PostApiAuthLoginBodyThree,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthLogin200>(
    { url: `/api/auth/login`, method: 'POST', data: postApiAuthLoginBody, signal },
    options,
  )
}

export const getPostApiAuthLoginMutationOptions = <
  TError = ErrorType<
    | PostApiAuthLogin400
    | PostApiAuthLogin401
    | PostApiAuthLogin409
    | PostApiAuthLogin500
    | PostApiAuthLogin503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthLogin>>,
    TError,
    {
      data: BodyType<PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree>
    },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiAuthLogin>>,
  TError,
  { data: BodyType<PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree> },
  TContext
> => {
  const mutationKey = ['postApiAuthLogin']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiAuthLogin>>,
    {
      data: BodyType<PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree>
    }
  > = (props) => {
    const { data } = props ?? {}

    return postApiAuthLogin(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthLoginMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthLogin>>
>
export type PostApiAuthLoginMutationBody = BodyType<
  PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree
>
export type PostApiAuthLoginMutationError = ErrorType<
  | PostApiAuthLogin400
  | PostApiAuthLogin401
  | PostApiAuthLogin409
  | PostApiAuthLogin500
  | PostApiAuthLogin503
>

export const usePostApiAuthLogin = <
  TError = ErrorType<
    | PostApiAuthLogin400
    | PostApiAuthLogin401
    | PostApiAuthLogin409
    | PostApiAuthLogin500
    | PostApiAuthLogin503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthLogin>>,
      TError,
      {
        data: BodyType<
          PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree
        >
      },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiAuthLogin>>,
  TError,
  { data: BodyType<PostApiAuthLoginBodyOne | PostApiAuthLoginBodyTwo | PostApiAuthLoginBodyThree> },
  TContext
> => {
  return useMutation(getPostApiAuthLoginMutationOptions(options), queryClient)
}
export const postApiAuthPasskeyRegisterOptions = (
  postApiAuthPasskeyRegisterOptionsBody:
    | BodyType<
        | PostApiAuthPasskeyRegisterOptionsBodyOne
        | PostApiAuthPasskeyRegisterOptionsBodyTwo
        | PostApiAuthPasskeyRegisterOptionsBodyThree
      >
    | PostApiAuthPasskeyRegisterOptionsBodyTwo
    | PostApiAuthPasskeyRegisterOptionsBodyThree,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthPasskeyRegisterOptions200>(
    {
      url: `/api/auth/passkey/register/options`,
      method: 'POST',
      data: postApiAuthPasskeyRegisterOptionsBody,
      signal,
    },
    options,
  )
}

export const getPostApiAuthPasskeyRegisterOptionsMutationOptions = <
  TError = ErrorType<
    | PostApiAuthPasskeyRegisterOptions400
    | PostApiAuthPasskeyRegisterOptions401
    | PostApiAuthPasskeyRegisterOptions409
    | PostApiAuthPasskeyRegisterOptions500
    | PostApiAuthPasskeyRegisterOptions503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthPasskeyRegisterOptions>>,
    TError,
    {
      data: BodyType<
        | PostApiAuthPasskeyRegisterOptionsBodyOne
        | PostApiAuthPasskeyRegisterOptionsBodyTwo
        | PostApiAuthPasskeyRegisterOptionsBodyThree
      >
    },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiAuthPasskeyRegisterOptions>>,
  TError,
  {
    data: BodyType<
      | PostApiAuthPasskeyRegisterOptionsBodyOne
      | PostApiAuthPasskeyRegisterOptionsBodyTwo
      | PostApiAuthPasskeyRegisterOptionsBodyThree
    >
  },
  TContext
> => {
  const mutationKey = ['postApiAuthPasskeyRegisterOptions']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiAuthPasskeyRegisterOptions>>,
    {
      data: BodyType<
        | PostApiAuthPasskeyRegisterOptionsBodyOne
        | PostApiAuthPasskeyRegisterOptionsBodyTwo
        | PostApiAuthPasskeyRegisterOptionsBodyThree
      >
    }
  > = (props) => {
    const { data } = props ?? {}

    return postApiAuthPasskeyRegisterOptions(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthPasskeyRegisterOptionsMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthPasskeyRegisterOptions>>
>
export type PostApiAuthPasskeyRegisterOptionsMutationBody = BodyType<
  | PostApiAuthPasskeyRegisterOptionsBodyOne
  | PostApiAuthPasskeyRegisterOptionsBodyTwo
  | PostApiAuthPasskeyRegisterOptionsBodyThree
>
export type PostApiAuthPasskeyRegisterOptionsMutationError = ErrorType<
  | PostApiAuthPasskeyRegisterOptions400
  | PostApiAuthPasskeyRegisterOptions401
  | PostApiAuthPasskeyRegisterOptions409
  | PostApiAuthPasskeyRegisterOptions500
  | PostApiAuthPasskeyRegisterOptions503
>

export const usePostApiAuthPasskeyRegisterOptions = <
  TError = ErrorType<
    | PostApiAuthPasskeyRegisterOptions400
    | PostApiAuthPasskeyRegisterOptions401
    | PostApiAuthPasskeyRegisterOptions409
    | PostApiAuthPasskeyRegisterOptions500
    | PostApiAuthPasskeyRegisterOptions503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthPasskeyRegisterOptions>>,
      TError,
      {
        data: BodyType<
          | PostApiAuthPasskeyRegisterOptionsBodyOne
          | PostApiAuthPasskeyRegisterOptionsBodyTwo
          | PostApiAuthPasskeyRegisterOptionsBodyThree
        >
      },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiAuthPasskeyRegisterOptions>>,
  TError,
  {
    data: BodyType<
      | PostApiAuthPasskeyRegisterOptionsBodyOne
      | PostApiAuthPasskeyRegisterOptionsBodyTwo
      | PostApiAuthPasskeyRegisterOptionsBodyThree
    >
  },
  TContext
> => {
  return useMutation(getPostApiAuthPasskeyRegisterOptionsMutationOptions(options), queryClient)
}
export const postApiAuthPasskeyRegisterVerify = (
  postApiAuthPasskeyRegisterVerifyBody:
    | BodyType<
        | PostApiAuthPasskeyRegisterVerifyBodyOne
        | PostApiAuthPasskeyRegisterVerifyBodyTwo
        | PostApiAuthPasskeyRegisterVerifyBodyThree
      >
    | PostApiAuthPasskeyRegisterVerifyBodyTwo
    | PostApiAuthPasskeyRegisterVerifyBodyThree,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthPasskeyRegisterVerify200>(
    {
      url: `/api/auth/passkey/register/verify`,
      method: 'POST',
      data: postApiAuthPasskeyRegisterVerifyBody,
      signal,
    },
    options,
  )
}

export const getPostApiAuthPasskeyRegisterVerifyMutationOptions = <
  TError = ErrorType<
    | PostApiAuthPasskeyRegisterVerify400
    | PostApiAuthPasskeyRegisterVerify401
    | PostApiAuthPasskeyRegisterVerify409
    | PostApiAuthPasskeyRegisterVerify500
    | PostApiAuthPasskeyRegisterVerify503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthPasskeyRegisterVerify>>,
    TError,
    {
      data: BodyType<
        | PostApiAuthPasskeyRegisterVerifyBodyOne
        | PostApiAuthPasskeyRegisterVerifyBodyTwo
        | PostApiAuthPasskeyRegisterVerifyBodyThree
      >
    },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiAuthPasskeyRegisterVerify>>,
  TError,
  {
    data: BodyType<
      | PostApiAuthPasskeyRegisterVerifyBodyOne
      | PostApiAuthPasskeyRegisterVerifyBodyTwo
      | PostApiAuthPasskeyRegisterVerifyBodyThree
    >
  },
  TContext
> => {
  const mutationKey = ['postApiAuthPasskeyRegisterVerify']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiAuthPasskeyRegisterVerify>>,
    {
      data: BodyType<
        | PostApiAuthPasskeyRegisterVerifyBodyOne
        | PostApiAuthPasskeyRegisterVerifyBodyTwo
        | PostApiAuthPasskeyRegisterVerifyBodyThree
      >
    }
  > = (props) => {
    const { data } = props ?? {}

    return postApiAuthPasskeyRegisterVerify(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthPasskeyRegisterVerifyMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthPasskeyRegisterVerify>>
>
export type PostApiAuthPasskeyRegisterVerifyMutationBody = BodyType<
  | PostApiAuthPasskeyRegisterVerifyBodyOne
  | PostApiAuthPasskeyRegisterVerifyBodyTwo
  | PostApiAuthPasskeyRegisterVerifyBodyThree
>
export type PostApiAuthPasskeyRegisterVerifyMutationError = ErrorType<
  | PostApiAuthPasskeyRegisterVerify400
  | PostApiAuthPasskeyRegisterVerify401
  | PostApiAuthPasskeyRegisterVerify409
  | PostApiAuthPasskeyRegisterVerify500
  | PostApiAuthPasskeyRegisterVerify503
>

export const usePostApiAuthPasskeyRegisterVerify = <
  TError = ErrorType<
    | PostApiAuthPasskeyRegisterVerify400
    | PostApiAuthPasskeyRegisterVerify401
    | PostApiAuthPasskeyRegisterVerify409
    | PostApiAuthPasskeyRegisterVerify500
    | PostApiAuthPasskeyRegisterVerify503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthPasskeyRegisterVerify>>,
      TError,
      {
        data: BodyType<
          | PostApiAuthPasskeyRegisterVerifyBodyOne
          | PostApiAuthPasskeyRegisterVerifyBodyTwo
          | PostApiAuthPasskeyRegisterVerifyBodyThree
        >
      },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiAuthPasskeyRegisterVerify>>,
  TError,
  {
    data: BodyType<
      | PostApiAuthPasskeyRegisterVerifyBodyOne
      | PostApiAuthPasskeyRegisterVerifyBodyTwo
      | PostApiAuthPasskeyRegisterVerifyBodyThree
    >
  },
  TContext
> => {
  return useMutation(getPostApiAuthPasskeyRegisterVerifyMutationOptions(options), queryClient)
}
export const postApiAuthPasskeyAuthenticationOptions = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthPasskeyAuthenticationOptions200>(
    { url: `/api/auth/passkey/authentication/options`, method: 'POST', signal },
    options,
  )
}

export const getPostApiAuthPasskeyAuthenticationOptionsMutationOptions = <
  TError = ErrorType<
    | PostApiAuthPasskeyAuthenticationOptions400
    | PostApiAuthPasskeyAuthenticationOptions401
    | PostApiAuthPasskeyAuthenticationOptions409
    | PostApiAuthPasskeyAuthenticationOptions500
    | PostApiAuthPasskeyAuthenticationOptions503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationOptions>>,
    TError,
    void,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationOptions>>,
  TError,
  void,
  TContext
> => {
  const mutationKey = ['postApiAuthPasskeyAuthenticationOptions']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationOptions>>,
    void
  > = () => {
    return postApiAuthPasskeyAuthenticationOptions(requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthPasskeyAuthenticationOptionsMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationOptions>>
>

export type PostApiAuthPasskeyAuthenticationOptionsMutationError = ErrorType<
  | PostApiAuthPasskeyAuthenticationOptions400
  | PostApiAuthPasskeyAuthenticationOptions401
  | PostApiAuthPasskeyAuthenticationOptions409
  | PostApiAuthPasskeyAuthenticationOptions500
  | PostApiAuthPasskeyAuthenticationOptions503
>

export const usePostApiAuthPasskeyAuthenticationOptions = <
  TError = ErrorType<
    | PostApiAuthPasskeyAuthenticationOptions400
    | PostApiAuthPasskeyAuthenticationOptions401
    | PostApiAuthPasskeyAuthenticationOptions409
    | PostApiAuthPasskeyAuthenticationOptions500
    | PostApiAuthPasskeyAuthenticationOptions503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationOptions>>,
      TError,
      void,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationOptions>>,
  TError,
  void,
  TContext
> => {
  return useMutation(
    getPostApiAuthPasskeyAuthenticationOptionsMutationOptions(options),
    queryClient,
  )
}
export const postApiAuthPasskeyAuthenticationVerify = (
  postApiAuthPasskeyAuthenticationVerifyBody:
    | BodyType<
        | PostApiAuthPasskeyAuthenticationVerifyBodyOne
        | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
        | PostApiAuthPasskeyAuthenticationVerifyBodyThree
      >
    | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
    | PostApiAuthPasskeyAuthenticationVerifyBodyThree,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthPasskeyAuthenticationVerify200>(
    {
      url: `/api/auth/passkey/authentication/verify`,
      method: 'POST',
      data: postApiAuthPasskeyAuthenticationVerifyBody,
      signal,
    },
    options,
  )
}

export const getPostApiAuthPasskeyAuthenticationVerifyMutationOptions = <
  TError = ErrorType<
    | PostApiAuthPasskeyAuthenticationVerify400
    | PostApiAuthPasskeyAuthenticationVerify401
    | PostApiAuthPasskeyAuthenticationVerify409
    | PostApiAuthPasskeyAuthenticationVerify500
    | PostApiAuthPasskeyAuthenticationVerify503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationVerify>>,
    TError,
    {
      data: BodyType<
        | PostApiAuthPasskeyAuthenticationVerifyBodyOne
        | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
        | PostApiAuthPasskeyAuthenticationVerifyBodyThree
      >
    },
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<
  Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationVerify>>,
  TError,
  {
    data: BodyType<
      | PostApiAuthPasskeyAuthenticationVerifyBodyOne
      | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
      | PostApiAuthPasskeyAuthenticationVerifyBodyThree
    >
  },
  TContext
> => {
  const mutationKey = ['postApiAuthPasskeyAuthenticationVerify']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationVerify>>,
    {
      data: BodyType<
        | PostApiAuthPasskeyAuthenticationVerifyBodyOne
        | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
        | PostApiAuthPasskeyAuthenticationVerifyBodyThree
      >
    }
  > = (props) => {
    const { data } = props ?? {}

    return postApiAuthPasskeyAuthenticationVerify(data, requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthPasskeyAuthenticationVerifyMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationVerify>>
>
export type PostApiAuthPasskeyAuthenticationVerifyMutationBody = BodyType<
  | PostApiAuthPasskeyAuthenticationVerifyBodyOne
  | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
  | PostApiAuthPasskeyAuthenticationVerifyBodyThree
>
export type PostApiAuthPasskeyAuthenticationVerifyMutationError = ErrorType<
  | PostApiAuthPasskeyAuthenticationVerify400
  | PostApiAuthPasskeyAuthenticationVerify401
  | PostApiAuthPasskeyAuthenticationVerify409
  | PostApiAuthPasskeyAuthenticationVerify500
  | PostApiAuthPasskeyAuthenticationVerify503
>

export const usePostApiAuthPasskeyAuthenticationVerify = <
  TError = ErrorType<
    | PostApiAuthPasskeyAuthenticationVerify400
    | PostApiAuthPasskeyAuthenticationVerify401
    | PostApiAuthPasskeyAuthenticationVerify409
    | PostApiAuthPasskeyAuthenticationVerify500
    | PostApiAuthPasskeyAuthenticationVerify503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationVerify>>,
      TError,
      {
        data: BodyType<
          | PostApiAuthPasskeyAuthenticationVerifyBodyOne
          | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
          | PostApiAuthPasskeyAuthenticationVerifyBodyThree
        >
      },
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof postApiAuthPasskeyAuthenticationVerify>>,
  TError,
  {
    data: BodyType<
      | PostApiAuthPasskeyAuthenticationVerifyBodyOne
      | PostApiAuthPasskeyAuthenticationVerifyBodyTwo
      | PostApiAuthPasskeyAuthenticationVerifyBodyThree
    >
  },
  TContext
> => {
  return useMutation(getPostApiAuthPasskeyAuthenticationVerifyMutationOptions(options), queryClient)
}
export const postApiAuthRefresh = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthRefresh200>(
    { url: `/api/auth/refresh`, method: 'POST', signal },
    options,
  )
}

export const getPostApiAuthRefreshMutationOptions = <
  TError = ErrorType<
    | PostApiAuthRefresh400
    | PostApiAuthRefresh401
    | PostApiAuthRefresh409
    | PostApiAuthRefresh500
    | PostApiAuthRefresh503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthRefresh>>,
    TError,
    void,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<Awaited<ReturnType<typeof postApiAuthRefresh>>, TError, void, TContext> => {
  const mutationKey = ['postApiAuthRefresh']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postApiAuthRefresh>>, void> = () => {
    return postApiAuthRefresh(requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthRefreshMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthRefresh>>
>

export type PostApiAuthRefreshMutationError = ErrorType<
  | PostApiAuthRefresh400
  | PostApiAuthRefresh401
  | PostApiAuthRefresh409
  | PostApiAuthRefresh500
  | PostApiAuthRefresh503
>

export const usePostApiAuthRefresh = <
  TError = ErrorType<
    | PostApiAuthRefresh400
    | PostApiAuthRefresh401
    | PostApiAuthRefresh409
    | PostApiAuthRefresh500
    | PostApiAuthRefresh503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthRefresh>>,
      TError,
      void,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<Awaited<ReturnType<typeof postApiAuthRefresh>>, TError, void, TContext> => {
  return useMutation(getPostApiAuthRefreshMutationOptions(options), queryClient)
}
export const postApiAuthLogout = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<PostApiAuthLogout200>(
    { url: `/api/auth/logout`, method: 'POST', signal },
    options,
  )
}

export const getPostApiAuthLogoutMutationOptions = <
  TError = ErrorType<
    | PostApiAuthLogout400
    | PostApiAuthLogout401
    | PostApiAuthLogout409
    | PostApiAuthLogout500
    | PostApiAuthLogout503
  >,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postApiAuthLogout>>,
    TError,
    void,
    TContext
  >
  request?: SecondParameter<typeof orvalMutator>
}): UseMutationOptions<Awaited<ReturnType<typeof postApiAuthLogout>>, TError, void, TContext> => {
  const mutationKey = ['postApiAuthLogout']
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined }

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postApiAuthLogout>>, void> = () => {
    return postApiAuthLogout(requestOptions)
  }

  return { mutationFn, ...mutationOptions }
}

export type PostApiAuthLogoutMutationResult = NonNullable<
  Awaited<ReturnType<typeof postApiAuthLogout>>
>

export type PostApiAuthLogoutMutationError = ErrorType<
  | PostApiAuthLogout400
  | PostApiAuthLogout401
  | PostApiAuthLogout409
  | PostApiAuthLogout500
  | PostApiAuthLogout503
>

export const usePostApiAuthLogout = <
  TError = ErrorType<
    | PostApiAuthLogout400
    | PostApiAuthLogout401
    | PostApiAuthLogout409
    | PostApiAuthLogout500
    | PostApiAuthLogout503
  >,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postApiAuthLogout>>,
      TError,
      void,
      TContext
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseMutationResult<Awaited<ReturnType<typeof postApiAuthLogout>>, TError, void, TContext> => {
  return useMutation(getPostApiAuthLogoutMutationOptions(options), queryClient)
}
export const getApiAuthOauthByProviderStart = (
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderStartParams,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<unknown>(
    { url: `/api/auth/oauth/${provider}/start`, method: 'GET', params, signal },
    options,
  )
}

export const getGetApiAuthOauthByProviderStartQueryKey = (
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderStartParams,
) => {
  return [`/api/auth/oauth/${provider}/start`, ...(params ? [params] : [])] as const
}

export const getGetApiAuthOauthByProviderStartQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderStartParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey =
    queryOptions?.queryKey ?? getGetApiAuthOauthByProviderStartQueryKey(provider, params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>> = ({
    signal,
  }) => getApiAuthOauthByProviderStart(provider, params, requestOptions, signal)

  return {
    queryKey,
    queryFn,
    enabled: provider !== null && provider !== undefined,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiAuthOauthByProviderStartQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>
>
export type GetApiAuthOauthByProviderStartQueryError = ErrorType<unknown>

export function useGetApiAuthOauthByProviderStart<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params: undefined | GetApiAuthOauthByProviderStartParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
          TError,
          Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiAuthOauthByProviderStart<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderStartParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
          TError,
          Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiAuthOauthByProviderStart<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderStartParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiAuthOauthByProviderStart<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderStartParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderStart>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiAuthOauthByProviderStartQueryOptions(provider, params, options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const getApiAuthOauthByProviderCallback = (
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderCallbackParams,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<unknown>(
    { url: `/api/auth/oauth/${provider}/callback`, method: 'GET', params, signal },
    options,
  )
}

export const getGetApiAuthOauthByProviderCallbackQueryKey = (
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderCallbackParams,
) => {
  return [`/api/auth/oauth/${provider}/callback`, ...(params ? [params] : [])] as const
}

export const getGetApiAuthOauthByProviderCallbackQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderCallbackParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey =
    queryOptions?.queryKey ?? getGetApiAuthOauthByProviderCallbackQueryKey(provider, params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>> = ({
    signal,
  }) => getApiAuthOauthByProviderCallback(provider, params, requestOptions, signal)

  return {
    queryKey,
    queryFn,
    enabled: provider !== null && provider !== undefined,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiAuthOauthByProviderCallbackQueryResult = NonNullable<
  Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>
>
export type GetApiAuthOauthByProviderCallbackQueryError = ErrorType<unknown>

export function useGetApiAuthOauthByProviderCallback<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params: undefined | GetApiAuthOauthByProviderCallbackParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
          TError,
          Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiAuthOauthByProviderCallback<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderCallbackParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
          TError,
          Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiAuthOauthByProviderCallback<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderCallbackParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiAuthOauthByProviderCallback<
  TData = Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>,
  TError = ErrorType<unknown>,
>(
  provider: 'google' | 'discord' | 'microsoft',
  params?: GetApiAuthOauthByProviderCallbackParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getApiAuthOauthByProviderCallback>>, TError, TData>
    >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiAuthOauthByProviderCallbackQueryOptions(provider, params, options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}

export const getApiAuthMe = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) => {
  return orvalMutator<GetApiAuthMe200>({ url: `/api/auth/me`, method: 'GET', signal }, options)
}

export const getGetApiAuthMeQueryKey = () => {
  return [`/api/auth/me`] as const
}

export const getGetApiAuthMeQueryOptions = <
  TData = Awaited<ReturnType<typeof getApiAuthMe>>,
  TError = ErrorType<
    GetApiAuthMe400 | GetApiAuthMe401 | GetApiAuthMe409 | GetApiAuthMe500 | GetApiAuthMe503
  >,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiAuthMe>>, TError, TData>>
  request?: SecondParameter<typeof orvalMutator>
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetApiAuthMeQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiAuthMe>>> = ({ signal }) =>
    getApiAuthMe(requestOptions, signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getApiAuthMe>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetApiAuthMeQueryResult = NonNullable<Awaited<ReturnType<typeof getApiAuthMe>>>
export type GetApiAuthMeQueryError = ErrorType<
  GetApiAuthMe400 | GetApiAuthMe401 | GetApiAuthMe409 | GetApiAuthMe500 | GetApiAuthMe503
>

export function useGetApiAuthMe<
  TData = Awaited<ReturnType<typeof getApiAuthMe>>,
  TError = ErrorType<
    GetApiAuthMe400 | GetApiAuthMe401 | GetApiAuthMe409 | GetApiAuthMe500 | GetApiAuthMe503
  >,
>(
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiAuthMe>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiAuthMe>>,
          TError,
          Awaited<ReturnType<typeof getApiAuthMe>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiAuthMe<
  TData = Awaited<ReturnType<typeof getApiAuthMe>>,
  TError = ErrorType<
    GetApiAuthMe400 | GetApiAuthMe401 | GetApiAuthMe409 | GetApiAuthMe500 | GetApiAuthMe503
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiAuthMe>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getApiAuthMe>>,
          TError,
          Awaited<ReturnType<typeof getApiAuthMe>>
        >,
        'initialData'
      >
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetApiAuthMe<
  TData = Awaited<ReturnType<typeof getApiAuthMe>>,
  TError = ErrorType<
    GetApiAuthMe400 | GetApiAuthMe401 | GetApiAuthMe409 | GetApiAuthMe500 | GetApiAuthMe503
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiAuthMe>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }

export function useGetApiAuthMe<
  TData = Awaited<ReturnType<typeof getApiAuthMe>>,
  TError = ErrorType<
    GetApiAuthMe400 | GetApiAuthMe401 | GetApiAuthMe409 | GetApiAuthMe500 | GetApiAuthMe503
  >,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getApiAuthMe>>, TError, TData>>
    request?: SecondParameter<typeof orvalMutator>
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetApiAuthMeQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>
  }

  return withQueryKey(query, queryOptions.queryKey)
}
