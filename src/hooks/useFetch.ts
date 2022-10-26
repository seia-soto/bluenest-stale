import { useEffect, useMemo, useReducer } from 'react'
import { IResponse, IResponseWithData } from '../models/api/protocol'
import { persistStorage } from '../models/client/kv'

export interface IFetchState<T extends IResponse = IResponseWithData> {
  isLoading: boolean
  isError: boolean
  status: number
  response: T
}

export const enum EFetchActionTypes {
  setIsLoading = 0,
  setIsError,
  setStatus,
  setResponse
}

export interface IFetchAction<A extends EFetchActionTypes, T> {
  type: A
  payload: T
}

export type TFetchAction<T extends IResponse = IResponseWithData> = IFetchAction<EFetchActionTypes.setIsLoading, IFetchState['isLoading']>
| IFetchAction<EFetchActionTypes.setIsError, IFetchState['isError']>
| IFetchAction<EFetchActionTypes.setStatus, IFetchState['status']>
| IFetchAction<EFetchActionTypes.setResponse, IFetchState<T>['response']>

const reducer = <T extends IResponse = IResponseWithData>(state: IFetchState<T>, action: TFetchAction<T>) => {
  const kState = { ...state }

  switch (action.type) {
    case EFetchActionTypes.setIsLoading: {
      kState.isLoading = action.payload

      break
    }
    case EFetchActionTypes.setIsError: {
      kState.isError = action.payload

      break
    }
    case EFetchActionTypes.setStatus: {
      kState.status = action.payload

      break
    }
    case EFetchActionTypes.setResponse: {
      kState.response = action.payload

      break
    }
  }

  return kState
}

const initialState = {
  isLoading: true,
  isError: false,
  status: 200,
  response: null
}

export interface IFetchCache<T extends IResponse = IResponseWithData> {
  exp: number
  data: T
}

export default <T extends IResponse = IResponseWithData>(url: string, init?: RequestInit) => {
  const [state, dispatch] = useReducer<typeof reducer<T>>(reducer, initialState as IFetchState<T>)
  const kState = useMemo(() => state, [state.isLoading])

  useEffect(() => {
    const controller = new AbortController()

    const cacheKey = `kBluenest::cache.fetch.${init?.method ?? 'GET'}:${url.toString()}`

    const getCache = () => {
      const cacheValue: IFetchCache<T> = JSON.parse(persistStorage.get(cacheKey))

      if (
        !cacheValue ||
        cacheValue.exp <= Date.now()
      ) {
        console.log('CLIENT CACHE MISS key=%s', cacheKey)

        return
      }

      console.log('CLIENT CACHE HIT key=%s', cacheKey)

      return cacheValue
    }

    const getResponse = async () => {
      const response = await fetch(url, init)

      if (response.status === 403) {
        persistStorage.clear()

        location.href = '/connect/authorize'
      }

      const json: T = await response.json()

      return {
        status: response.status,
        json
      }
    }

    const getResponseOrCache = async () => {
      const cached = getCache()

      if (cached) {
        return { status: 200, json: cached.data }
      }

      const { status, json } = await getResponse()

      if (
        status === 200 &&
        json.meta.cache.client.exp > 0
      ) {
        console.log('CLIENT CACHE SET key=%s ttl=%d', cacheKey, json.meta.cache.client.exp)

        persistStorage.set(cacheKey, JSON.stringify({
          exp: Date.now() + json.meta.cache.client.exp,
          data: json
        }))
      }

      return { status, json }
    }

    getResponseOrCache()
      .then(({ status, json }) => {
        dispatch({ type: EFetchActionTypes.setStatus, payload: status })
        dispatch({ type: EFetchActionTypes.setResponse, payload: json })
      })
      .catch(error => {
        console.error(error)

        dispatch({ type: EFetchActionTypes.setIsError, payload: true })
      })
      .finally(() => dispatch({ type: EFetchActionTypes.setIsLoading, payload: false }))

    return () => controller.abort()
  }, [])

  return kState
}
