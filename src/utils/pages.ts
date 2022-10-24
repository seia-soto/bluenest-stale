import { getCookie } from 'cookies-next'
import { NextRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { EResponseStatus, IResponse } from '../models/types/api'
import { getDriver } from '../models/webkv'

export const goto = (router: NextRouter, url: string, force?: boolean) => () => {
  if (force) {
    location.href = url

    return
  }

  router
    .push(url)
    .catch(_ => {
      location.href = url
    })
}

export interface IFetchOption {
  cacheTtl: number
  delayedAfter: number
}

export interface ICachedFetch<T> {
  iat: number
  data: IResponse<T>
}

export const useFetch = <T>(url: string | URL, init?: RequestInit, _opts?: Partial<IFetchOption>) => {
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(false)
  const [status, setStatus] = useState<EResponseStatus>(EResponseStatus.Ok)
  const [data, setData] = useState<T>(null)

  const organized = useMemo(() => ({
    isLoading,
    isError,
    status,
    data
  }), [isLoading])

  const defaultOpts: IFetchOption = {
    cacheTtl: 10 * 1000,
    delayedAfter: 3 * 1000
  }
  const opts: IFetchOption = useMemo(() => Object.assign(
    defaultOpts,
    _opts
  ), [_opts])

  useEffect(() => {
    const controller = new AbortController()
    const cacheKey = `fetch-cache-${init?.method ?? 'GET'}.${url.toString()}`
    const driver = getDriver()

    // Get actual cache
    const getCache = () => {
      const value = driver.get(cacheKey)

      if (value) {
        const cached: ICachedFetch<T> = JSON.parse(value)

        if (cached.iat + opts.cacheTtl >= Date.now()) {
          return [true, cached.data] as const
        } else {
          driver.del(cacheKey)
        }
      }

      return [false] as const
    }

    // Get actual response
    const getResponse = async () => {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      })

      if (response.status === 403) {
        controller.abort()

        location.href = '/connect/authorize'
      }

      const data: IResponse<T> = await response.json()

      return data
    }

    // Perform cached request
    const getCachedResponse = async () => {
      const [isCacheAvailable, cached] = getCache()

      if (isCacheAvailable) {
        setStatus(cached.status)
        setData(cached.data)

        return
      }

      const response = await getResponse()

      setStatus(response.status)
      setData(response.data)

      if (response.status !== EResponseStatus.Ok) {
        return
      }

      const cache: ICachedFetch<T> = { iat: Date.now(), data: response }

      driver.set(cacheKey, JSON.stringify(cache))
    }

    // Perform live request
    const getLiveResponse = async () => {
      const { status, data } = await getResponse()

      setStatus(status)
      setData(data)
    }

    const perform = async () => {
      if (opts.cacheTtl >= 0) {
        const sessionKey = getCookie('ab')?.toString()
        const existingSessionKey = driver.get('cache-session')

        if (sessionKey !== existingSessionKey) {
          driver.bulkDelPrefixed('fetch-cache')
          driver.set('cache-session', sessionKey)
        }

        return await getCachedResponse()
      } else {
        return await getLiveResponse()
      }
    }

    perform()
      .then(() => setLoading(false))
      .catch(_ => setError(true))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return organized
}

export const useTokenRefresher = () => {
  useEffect(() => {
    const driver = getDriver()

    if (!driver.get('cache-session')) {
      return
    }

    // eslint-disable-next-line prefer-const
    let timer: NodeJS.Timer

    const getRefreshed = () => {
      fetch('/api/session/refresh', { method: 'POST' })
        .then(response => {
          if (response.status !== 200 && timer) {
            clearInterval(timer)
          }
        })
        .catch(_ => {
          clearInterval(timer)
        })
    }

    getRefreshed()

    timer = setInterval(getRefreshed, 60 * 1000 * 2 + 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])
}
